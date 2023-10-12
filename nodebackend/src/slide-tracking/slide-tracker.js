require('console-info');
require('console-warn');
require('console-error');

let mysql = require('mysql')
let mysqlConfig = require('../mysqlConfig')
const url = require('url')
let dateFormat = require('dateformat')
let fs = require('fs')

module.exports = {
  printSlides: printSlides,
  getUserInfo: getUserInfo,
  updateSlideToPrint: updateSlideToPrint,
  pullSlides: pullSlides,
  getPartBlockCurrentAndTotals: getPartBlockCurrentAndTotals,
  histodata: histoData,
  slideDistribution: slideDistribution,
  GetBlockData: GetBlockData,
  SetBlockData: SetBlockData,
  GetStatusData: GetStatusData,
  GetCassEngLoc: GetCassEngLoc,
  GetCaseInquery: GetCaseInquery,
  SetCassEngLoc: SetCassEngLoc
}

let lastQueryTimes=[];
function CheckLastQueryCache(queryName,waitTime=30){
  if (lastQueryTimes[queryName]){
    let now = new Date().toLocaleString("en-US", {timeZone: "America/Chicago"})
    let lastTime = lastQueryTimes[queryName].date
    now = parseInt((new Date(now).getTime() / 1000).toFixed(0))
    lastTime = parseInt((new Date(lastTime).getTime() / 1000).toFixed(0))
    console.log(now)
    console.log(lastTime)
    console.log(Math.abs(lastTime  - now) )
    if (Math.abs(lastTime - now) < 60*1000*waitTime){
      console.warn(queryName+" Cached Data")
      lastQueryTimes[queryName].data[0].timestamp = lastTime
      console.log(lastQueryTimes[queryName].data)
      return lastQueryTimes[queryName].data
    }
    console.warn(queryName+" Expired Data")
  }
  console.warn(queryName+" DB Data")
}

function db_query(query) {
  return new Promise((resolve, reject) => {
    let con = mysql.createConnection(mysqlConfig)
    try {
      let sql_query = '/* Slide Tracker API*/ ' + query
      console.log("SQL QUERY: " + sql_query)
      con.query(sql_query, function (err, result) {
        if (err) {
          console.log(err)
          reject(err);
        }
        resolve(result)
      })
    }
    catch (error){
      console.error("SQL QUERY FAILED: " + sql_query+' : '+error)
    }
    finally {
      if (con) {
        con.end()
      }
    }
  })
}

async function printSlides (request, response) {

  let strDate = new Date().toLocaleString("en-US", {timeZone: "America/Chicago"})
  let currentFiles=[]
  let strBlockID = request.body.blockID
  let strPrintRequestBy = request.body.printRequestedBy
  let strSlideQueuePath = request.body.slideQueuePath
  if (strSlideQueuePath){if (strSlideQueuePath.slice(-1) !== '/') {strSlideQueuePath = strSlideQueuePath+'/'}}
  let strLocationID = request.body.printLocation || 'unknown'
  let strOrderPathInitials = ''
  var strSQL = `
           SELECT tblSlides.StainOrderDate,
           tblSlides.SlideID,
           tblSlides.AccessionID,
           tblSlides.SlideInst,
           tblSlides.PartDesignator,
           tblSlides.BlockDesignator,
           tblSlides.Patient,
           tblSlides.SiteLabel,
           tblSlides.StainLabel,
           tblCassetteColorHopperLookup.Color AS SlideDistributionKeyword,
           copath_c_d_person_1.initials       AS OrderPathInitials
              FROM tblSlides
             LEFT JOIN (copath_p_stainprocess,tblBlock,tblCassetteColorHopperLookup,copath_c_d_stainstatus,copath_c_d_person,copath_c_d_person AS copath_c_d_person_1,copath_c_d_department)
                       ON (tblSlides.BlockStainInstID = copath_p_stainprocess._blockstaininstid
                           and tblSlides.BlockID = tblBlock.BlockID
                           and tblBlock.Hopper = tblCassetteColorHopperLookup.HopperID
                           and copath_p_stainprocess.stainstatus_id = copath_c_d_stainstatus.id
                           and copath_p_stainprocess.status_who_id = copath_c_d_person.id
                           and copath_p_stainprocess.orderedby_id = copath_c_d_person_1.id
                           and copath_p_stainprocess.wkdept_id = copath_c_d_department.id)
            WHERE (((tblSlides.BlockID) = '${strBlockID}') AND tblSlides.ToBePrinted = TRUE);
            `
      var result = await db_query(strSQL).then((res)=> res).catch((e)=>(console.error(e)))
      let intRowCounter = 0
      for (const key of Object.keys(result)) {
        intRowCounter=intRowCounter+1
        let row = result[key]
        row.StainOrderDate = dateFormat(row.StainOrderDate, 'shortDate')

        row.OrderPathInitials == null || row.OrderPathInitials === 'null'
              ? strOrderPathInitials = ''
              : strOrderPathInitials = row.OrderPathInitials.substring(0, 3)

        let fileDate = new Date().toLocaleDateString().replace('-', '').replace('/', '')


        fs.readdirSync(strSlideQueuePath).forEach(file => {
          currentFiles.append(file)
        });

        // WriteSlideData
        // SlideID|AccessionID|SlideInst|PartDesignator|BlockDesignator|StainOrderDate|OrderingPath|Patient|SiteLabel|SlideDistributionKeyword|StainLabel
        let strFileWriteData = [
              row.SlideID,
              row.AccessionID,
              row.SlideInst,
              row.PartDesignator,
              row.BlockDesignator,
              row.StainOrderDate,
              strOrderPathInitials,
              row.Patient,
              row.SiteLabel,
              row.SlideDistributionKeyword,
              row.StainLabel
            ].join('|');
        let strSlideFlatFileFullName = strSlideQueuePath + row.SlideID + '_' + fileDate + '.txt'
        fs.writeFileSync(strSlideFlatFileFullName, strFileWriteData,
            function (err) {
              if (err) throw err
              console.error(err)
              response.send(err)
            })

        try {
          if (fs.existsSync(strSlideFlatFileFullName)) {
            console.log("FILE DOES EXIST: "+strSlideFlatFileFullName)
          }
        } catch(err) {
          console.error("FILE DOESNT EXIST: "+err)
          response.send(err)
        }
        strSQL = `
              UPDATE tblSlides
              SET
                  Status = 'Printed',
                  Printed = TRUE,
                  DateTimePrinted =  strDate  ,
                  DTPrinted = NOW(),
                  LocationPrinted =  strLocationID ,
                  WhoPrinted =   strPrintRequestBy ,
                  TimesPrinted = TimesPrinted + 1,
                  Audit = CONCAT(Audit,'Slide Printed' + strDate + ' at ' + strLocationID + ' by ' + strPrintRequestBy + '.'),
                  ToBePrinted = FALSE
              WHERE
                  SlideID =   row.SlideID ;
        `
        await db_query(strSQL).catch( (e)=>(console.error(e)))
      }

  let strTempSQL = `
        /*qryUpdateBlockSlidesPrinted*/
        UPDATE OPENLIS.tblBlock
        SET
        BlockStatus = 'Cut',
        TimesSlidesPrintedAtMicrotomy = COALESCE(TimesSlidesPrintedAtMicrotomy, 0) + ${intRowCounter},
        FirstSlidePrintedDT = IF( AnySlidesPrinted = 1, FirstSlidePrintedDT, NOW()),
        LastSlidePrintedDT = IF( AnySlidesPrinted = 1, NOW(), LastSlidePrintedDT),
        AnySlidesPrinted = 1,
        Audit = CONCAT(COALESCE(Audit), ' ', NOW(), ' ${intRowCounter} slide(s) printed off block by ${strPrintRequestBy} at ${strLocationID}.')
        WHERE BlockID = '${strBlockID}';
        /*qryUpdatetblActionTrackingSlidesPrinted*/
          INSERT INTO OPENLIS.tblActionTracking (
            Action,
            IDOfMaterial,
            User,
            Station,
            ActionDateTime,
            Count
          )
          VALUES (
            'SlidesPrintedOffBlock',
            '${strBlockID}',
            '${strPrintRequestBy}',
            '${strLocationID}',
            NOW(),
            ${intRowCounter}
          );
        `
  await db_query(strSQL).catch((e)=>(console.error(e)))
  response.send({info:'Slides have been sent to Slide Printer',files:currentFiles})
}
async function GetCaseInquery(request, response) {
  console.log(request.body)
  let strStrAccessionID = request.body.ACCESSIONID
  var strSQL = `
      /*qryCaseInquiry*/
      SELECT tblSlides.SlideID, 
              tblSlides.StainLabel, 
              tblSlideDistribution.Status, 
              tblSlides.StainOrderDate as 'Order Time',
              tblBlock.DateTimeEngraved,
              tblActionTracking.Station as 'Embedded Location',
              tblActionTracking.ActionDateTime as 'Embedded Time',
              tblSlides.LocationPrinted as 'Slide Printed Location', 
              tblSlides.DTPrinted as 'Slide Printed Time', 
              tblSlideDistribution.SlideDistributionLocation, 
              tblSlideDistribution.DTReadyForCourier, 
              tblSlideDistribution.SlideTray
      FROM   (tblSlides 
              LEFT JOIN tblSlideDistribution 
                      ON tblSlides.SlideDistributionID = 
                        tblSlideDistribution.SlideDistributionID) 
              LEFT JOIN tblBlock 
                    ON tblSlides.BlockID = tblBlock.BlockID 
              LEFT JOIN tblActionTracking 
                    ON tblSlides.BlockID = tblActionTracking.IDOfMaterial
                    and tblActionTracking.Action='Embedded'
      WHERE  (( ( tblSlides.AccessionID ) LIKE "${strStrAccessionID}")) order by DTPrinted DESC;`
  if (request.body.materialAudit) {
    strSQL = `SELECT Action,IDOfMaterial ,User,Station,ActionDateTime from tblActionTracking tat  where tat.IDOfMaterial like '${strStrAccessionID}' order by ActionDateTime desc;`
  }
  var old_data = CheckLastQueryCache('GetCaseInquery')
  if (old_data) {
    return response.json(old_data)
  }
  else {
    await db_query(strSQL).then((res) => {
      lastQueryTimes['GetCaseInquery'] = {date: new Date().toLocaleString("en-US", {timeZone: "America/Chicago"}), data: res}
      res[0].timestamp = new Date().toLocaleString("en-US", {timeZone: "America/Chicago"})
      response.json(res)
    }).catch((e) => (console.error(e)))
  }
}
async function GetStatusData(request, response) {
  let old_data = CheckLastQueryCache('GetStatusData')
  if (old_data) {
    lastQueryTimes['GetStatusData'] = {date: new Date().toLocaleString("en-US", {timeZone: "America/Chicago"}), data: old_data}
    old_data[0].timestamp = new Date().toLocaleString("en-US", {timeZone: "America/Chicago"})
    response.json(old_data)}

  else {
    var strSQL = `    
        select t.count,t.PreEmbedded as 'Action'
        from (
        select count(*) as 'count','PreEmbedded'
        from tblBlock
        where 1 not in (select IDOfMaterial from tblActionTracking)
        and BlockStatus is null
        and PartDescription not like 'B%' -- bone marrow
        and DateTimeEngraved > date_format(curdate() - if(weekday(curdate()) >= 5, if(weekday(curdate()) = 6, 2, 1), 1),'%Y-%m-%d 18:00:00')
        and TimesEngraved>0
        union all
        select count(action),action
        from tblActionTracking
        where ActionDateTime  > date_format(curdate() - if(weekday(curdate()) >= 5, if(weekday(curdate()) = 6, 2, 1), 1),'%Y-%m-%d 18:00:00')
        group by action
        union all
        SELECT count(distinct BlockID),'distributed'
        FROM tblSlides
        INNER JOIN   tblSlideDistribution on tblSlides.SlideDistributionID = tblSlideDistribution.SlideDistributionID
        WHERE tblSlideDistribution.DTReadyForCourier > date_format(curdate() - if(weekday(curdate()) >= 5, if(weekday(curdate()) = 6, 2, 1), 1),'%Y-%m-%d 18:00:00')
        ) as t
    `
    await db_query(strSQL)
        .then(function(res) {
          lastQueryTimes['GetStatusData'] = {date: new Date().toLocaleString("en-US", {timeZone: "America/Chicago"}), data: res}
          res[0].timestamp = new Date().toLocaleString("en-US", {timeZone: "America/Chicago"})
          response.json(res)
        })
        .catch((rej)=>{
          throw rej
        })
  }
}
async function getUserInfo (request, response) {

  let strUserID = request.body.userid
  var strSQL = `SELECT * FROM tblUsers WHERE id = '${strUserID}';`
  await db_query(strSQL).then((res)=> {response.json(res)}).catch((e)=>(console.error(e)))

}
async function GetBlockData (request, response) {

  let blockID = request.body.blockID
  var strSQL = `SELECT * FROM tblBlock WHERE BlockID = '${blockID}'`
  await db_query(strSQL).then((res)=> {response.json(res)}).catch((e)=>(console.error(e)))

}
async function SetBlockData(request, response) {
  let blockData = request.body.blockData.data[0]
  let { userid, curRoute } = request.body;
  console.log(JSON.stringify(blockData))
  let ScanLocation = blockData.WorkstationID
  let TimesScanned         = (!blockData.TimesScannedAtEmbedding) ? 1: blockData.TimesScannedAtEmbedding+1
  let BlockID			   = blockData.BlockID


  var strSQL = `
      UPDATE tblBlock
      SET BlockStatus = 'Embedded',embedded   = 1,embeddedDT  = NOW(),
      TimesScannedAtEmbedding = ${TimesScanned}
      WHERE BlockID = '${BlockID}';
  `
  await db_query(strSQL).catch((e)=>(console.error(e)))

  var strSQL = `
    INSERT INTO tblActionTracking
          (Action,IDOfMaterial,User,Station,ActionDateTime)
          VALUES('Embedded','${BlockID}','${userid}','${ScanLocation}',NOW());
    `
  await db_query(strSQL).then(response.send('OK')).catch((e)=>(console.error(e)))
}
async function GetCassEngLoc (request, response) {
  var strSQL = `select old_value,new_value,right_left_value,updt_dt_tm from engraver_lookup;`
  await db_query(strSQL)
    .then((res) => response.json(res))
    .catch((e) => (console.error(e)))
}

async function SetCassEngLoc (request, response) {
  request['body']['data'].forEach((el)=>{
    if ('new_value' in el && 'right_left_value' in el && 'old_value' in el ){
      strSQL = `update engraver_lookup set new_value = "${el.new_value}",right_left_value = ${el.right_left_value} where old_value = "${el.old_value}";`;
      console.log(strSQL)
      db_query(strSQL).catch((e)=>(console.error(e)))
    }
  })
  console.log(JSON.stringify(await db_query('select max(updt_dt_tm) from engraver_lookup')))
  response.send({ info: 'Success',engraverData: this.GetCassEngLoc(request) })
}

async function getPartBlockCurrentAndTotals (request, response) {
  let strBlockID = request.body.blockID
  const {strAccessionId,strCurrentPart,strCurrentBlock} = strBlockID.substring(4).split('_')
  var strSQLTotalBlocks = `
        SELECT BlockDesignator FROM OPENLIS.tblBlock 
        where SpecNumFormatted = '${strAccessionId}' 
        AND PartDesignator = '${strCurrentPart}'
        order by ABS(BlockDesignator) desc limit 1;`
  var strSQLTotalParts = `
        SELECT PartDesignator FROM OPENLIS.tblBlock 
        where SpecNumFormatted = '${strAccessionId}' 
        order by PartDesignator desc LIMIT 1;`
  var strSQL = strSQLTotalBlocks + strSQLTotalParts
  await db_query(strSQL).then((result) => { 
    let strTotalBlocks = result[0][0].BlockDesignator
    let strTotalParts = result[1][0].PartDesignator
    let jsonResult = {
      currentblock: strCurrentBlock,
      currentpart: strCurrentPart,
      totalblocks: strTotalBlocks,
      totalparts: strTotalParts
    }
    response.json(jsonResult)
  })
    .catch((e) => (console.error(e)))
    response.send('error')

}
async function updateSlideToPrint (request, response) {
  const {slideId:strSlideID, toPrintStatus:blToPrintStatus} = request.body

  var strSQL = `
            update tblSlides
            set ToBePrinted =  '${blToPrintStatus}'
            where SlideID =  ${strSlideID}
            `

  await db_query(strSQL).then(response.send('OK')).catch((e)=>(console.error(e)))
}
async function pullSlides (request, response) {
  let strBlockID = request.body.blockID
  console.log(request.body)
  if (strBlockID == 'undefined') response.send('error');
  else {
    var strSQL = `
          SELECT ts.AccessionID,ts.PartDesignator,ts.BlockDesignator,ts.Patient,ts.StainLabel,
          ts.ToBePrinted,ts.SlideInst,ts.slidecount,ts.StainOrderDate,ts.SiteLabel,ts.SlideID,ts.Status FROM   tblSlides ts
          WHERE  (( ( ts.BlockID ) = '${strBlockID}' )); `
    await db_query(strSQL)
      .then((result) => {
        if (result) {
          console.log(result)
          if ('error' in result) {
            response.send(result['error'])
          }
          Object.keys(result).forEach(function (key) {
            let row = result[key]
            row.StainOrderDate = dateFormat(row.StainOrderDate, 'shortDate')
            if (row.OrderingPath === 'null') {
              row.OrderingPath = ''
            }
          })
          response.json(result)
        }
      }).catch((e) => (console.error(e)))
  }
}

async function histoData (request, response) {
  const {fromdatetime:strFromDateTime, todatetime:strToDateTime} = request.body;
  var strSQL = `
        SELECT qrySubBlocksPreviousDay.WhoPrinted, Count(qrySubBlocksPreviousDay.BlockID) AS CountOfBlockID
        FROM (SELECT tblSlides.WhoPrinted, tblSlides.BlockID
        FROM tblSlides
        WHERE (((tblSlides.DTPrinted)>=('${strFromDateTime}') And (tblSlides.DTPrinted)<'${strToDateTime}'))
        GROUP BY tblSlides.WhoPrinted, tblSlides.BlockID) as qrySubBlocksPreviousDay
        GROUP BY qrySubBlocksPreviousDay.WhoPrinted;`
  await db_query(strSQL).then((res)=>response.json(res)).catch((e)=>(console.error(e)))
}

async function slideDistribution (request, response) {
  const {action:strAction, userid:strUser, scanlocation:strScanLocation} = request.body;
  switch (strAction) {
    case 'CreateNewSlideDistribution':
      let strSlideTrayID = request.body.slidetray
      var strSQL = `
                INSERT INTO OPENLIS.tblSlideDistribution
                (SlideTray,
                Status,
                WhoMarkedReadyForCourier,
                DTReadyForCourier,
                SlideDistributionLocation,
                StationSlideTrayScanned,
                Audit)
                VALUES
                ('${strSlideTrayID}',
                'PendingLocation',
                '${strUser}',
                NOW(),
                'Location Being Assigned',
                '${strScanLocation}',
                concat('Initial insert:', now(), ' ')
                );
            `
      await db_query(strSQL).then((res)=>response.json(res)).catch((e)=>(console.error(e)))
      break
    case 'MarkSlideToBeDistributed':
      let strSlideDistID = request.body.slidedistid
      let strSlideTray = request.body.slidetray
      let strSlideID = request.body.slideid
      var strSQLMarkToBeDistributed = `
            UPDATE OPENLIS.tblSlides
            SET
            Status = 'ReadyForCourier',
            Audit = CONCAT(Audit, 'Marked in tray:',NOW(), '.'),
            SlideStatusID = '$itpl',
            SlideDistributionID = ${strSlideDistID}
            WHERE SlideID = '${strSlideID}';
            /*qrySlideCountInTrayBySlideDistr*/
            SELECT 	distinct ts3.SlideID,
            ts1.CaseSlidesInTray,
            ts2.CaseSlidesTotal,
            ts2.CaseSlidesTotal-ts1.CaseSlidesInTray
            from
            (SELECT AccessionID,COUNT(SlideID) AS CaseSlidesInTray FROM tblSlides 
            where SlideDistributionID = ${strSlideDistID} GROUP BY AccessionID, SlideCount) ts1
            inner join
            (SELECT AccessionID,COUNT(tblSlides.SlideID) AS CaseSlidesTotal FROM tblSlides 
            where AccessionID IN (select distinct AccessionID from tblSlides 
            where SlideDistributionID = ${strSlideDistID}) 
            GROUP BY AccessionID) ts2
            on ts1.AccessionID = ts2.AccessionID
            inner join
            (SELECT SlideID,AccessionID FROM tblSlides where tblSlides.SlideDistributionID = ${strSlideDistID} 
            GROUP BY SlideID,AccessionID) ts3
            on ts1.AccessionID = ts3.AccessionID
            order by ts3.SlideID;
            SELECT Count(SlideID) AS 'SlidesInTray'
            FROM tblSlides
            WHERE SlideDistributionID = (SELECT max(subTblSlideDistribution.SlideDistributionID) 
            as SlideDistID FROM tblSlideDistribution as subTblSlideDistribution where SlideTray = '${strSlideTray}');
            SELECT Count(qrySubBlocksCorrespondingToPendingSlides.subBlockID) AS BlockCountInTray
            FROM (SELECT subTblSlides.BlockID AS subBlockID
            FROM tblSlides as subTblSlides
            WHERE subTblSlides.SlideDistributionID = ${strSlideDistID}
            GROUP BY subTblSlides.BlockID) AS qrySubBlocksCorrespondingToPendingSlides;
          `
      await db_query(strSQLMarkToBeDistributed).then((res)=>response.json(res)).catch((e)=>(console.error(e)))
      break
    case 'MarkSlidesReadyForCourier':
      let strSlideDistIDMarkForCourier = request.body.slidedistid
      let strUserMarkForCourier = request.body.userid
      let strSlideDistrLocID = request.body.slidedistrloc
      let strScanLocationMarkForCourier = request.body.scanlocation
      var strSQLMarkSlidesReadyForCourier = `
        UPDATE OPENLIS.tblSlideDistribution
        SET
        Status = 'Ready For Courier',
        DTReadyForCourier = NOW(),
        SlideDistributionLocation = '${strSlideDistrLocID}',
        Audit = CONCAT(Audit, 'Assigned location, marked ready for courier:',NOW(), '.'),
        StationLocationScanned = '${strScanLocationMarkForCourier}',
        WhoSetLocation = '${strUserMarkForCourier}'
        WHERE SlideDistributionID = ${strSlideDistIDMarkForCourier};
        UPDATE OPENLIS.tblSlides
        SET
        SlideStatusID = '$rfc'
        WHERE SlideDistributionID = ${strSlideDistIDMarkForCourier};
      `
      await db_query(strSQLMarkSlidesReadyForCourier).then((res)=>response.json(res)).catch((e)=>(console.error(e)))
      break
    case 'AssignTrayNewLocation':
      let strUserTrayNewLoc = request.body.userid
      let strSlideDistrLocIDForST = request.body.slidedistrloc
      let strScanLocationForST = request.body.scanlocation
      let strSlideTrayIDForST = request.body.slidetray
      var strSQLAssignNewLoc = `
        UPDATE OPENLIS.tblSlideDistribution as tblUpdate
        Inner Join (SELECT max(subTblSlideDistribution.SlideDistributionID) as SlideDistID 
        FROM tblSlideDistribution as subTblSlideDistribution where SlideTray = '${strSlideTrayIDForST}') 
        as tblB ON tblUpdate.SlideDistributionID = tblB.SlideDistID
        SET
        tblUpdate.SlideDistributionLocation = '${strSlideDistrLocIDForST}',
        tblUpdate.Audit = CONCAT(tblUpdate.Audit, 'Assigned location:',NOW(), '.'),
        tblUpdate.StationLocationScanned = '${strScanLocationForST}',
        tblUpdate.WhoSetLocation = '${strUserTrayNewLoc}'
        WHERE tblUpdate.SlideDistributionID = SlideDistID;`
      await db_query(strSQLAssignNewLoc).then((res)=>response.json(res)).catch((e)=>(console.error(e)))
      break
    case 'LoadSlideTray':
      let strSlideTrayIDExistingST = request.body.slidetray
      var strSQLExistingST = `
      /*Query01*/
      SELECT max(subTblSlideDistribution.SlideDistributionID) as CurrentSlideDistID
      FROM tblSlideDistribution as subTblSlideDistribution
      WHERE SlideTray = '${strSlideTrayIDExistingST}';
      /*qrySlideCountInTrayBySlideTray*/
      SELECT
          tblSlides.SlideID,
          qrySubSlideCountsByAcc.CaseSlidesInTray,
          qrySubSlideCountsByAcc.CaseSlidesTotal,
          qrySubSlideCountsByAcc.CaseSlidesNotInTray
      FROM
          tblSlides
              INNER JOIN
          (SELECT
              qrySlideCountInTrayByCase.AccessionID,
                  qrySlideCountInTrayByCase.CaseSlidesInTray,
                  vwSlideCountByCase.CaseSlidesTotal,
                  (vwSlideCountByCase.CaseSlidesTotal - qrySlideCountInTrayByCase.CaseSlidesInTray) AS CaseSlidesNotInTray
          FROM
              (SELECT
              tblSlides.AccessionID,
                  COUNT(tblSlides.SlideID) AS CaseSlidesInTray
          FROM
              tblSlides
          WHERE
              (((tblSlides.SlideDistributionID) = (SELECT max(subTblSlideDistribution.SlideDistributionID) 
              as SlideDistID FROM tblSlideDistribution as subTblSlideDistribution 
              where SlideTray = '${strSlideTrayIDExistingST}')))
          GROUP BY tblSlides.AccessionID , tblSlides.SlideCount) AS qrySlideCountInTrayByCase
          INNER JOIN vwSlideCountByCase ON qrySlideCountInTrayByCase.AccessionID = vwSlideCountByCase.AccessionID)
          AS qrySubSlideCountsByAcc ON qrySubSlideCountsByAcc.AccessionID = tblSlides.AccessionID
      WHERE
          tblSlides.SlideDistributionID = (SELECT max(subTblSlideDistribution.SlideDistributionID) as SlideDistID 
          FROM tblSlideDistribution as subTblSlideDistribution where SlideTray = '${strSlideTrayIDExistingST}');
      SELECT Count(SlideID) AS 'SlidesInTray'
      FROM tblSlides
      WHERE SlideDistributionID = (SELECT max(subTblSlideDistribution.SlideDistributionID) as SlideDistID
       FROM tblSlideDistribution as subTblSlideDistribution where SlideTray = '${strSlideTrayIDExistingST}');
      SELECT Count(qrySubBlocksCorrespondingToPendingSlides.subBlockID) AS BlockCountInTray
      FROM (SELECT subTblSlides.BlockID AS subBlockID
            FROM tblSlides as subTblSlides
            WHERE subTblSlides.SlideDistributionID = (SELECT max(subTblSlideDistribution.SlideDistributionID) 
            as SlideDistID FROM tblSlideDistribution as subTblSlideDistribution
             where SlideTray = '${strSlideTrayIDExistingST}')
            GROUP BY subTblSlides.BlockID) AS qrySubBlocksCorrespondingToPendingSlides
      ;`
      await db_query(strSQLExistingST).then((res)=>response.json(res)).catch((e)=>(console.error(e)))
      break
  }
}