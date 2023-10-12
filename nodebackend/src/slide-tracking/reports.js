var mysql = require('mysql')
var mysqlConfig = require('../mysqlConfig')
// const url = require('url')
// var dateFormat = require('dateformat')
// var fs = require('fs')

module.exports = {

  reports: reports
}

function reports (request, response, callback) {
// ===========================================================================================
//    Reports
// ============================================================================================

  console.log('reports start')
  const strReportName = request.body.action
  let strSQL = null

  console.log(strReportName)

  // Set SQL based on action
  switch (strReportName) {
    case 'blockcount':
      // console.log('Hello report block count')

      strSQL = `/* qryTotalBlockCountWSort
      Total Block Count: Previous Busines Day Plus Hours set from tbleRunTime 'PreviousDayCutoff*/
      SELECT Count(qrySubBlockCountWLocation.subBlockID) AS BlockCount, SlideDistributionLocation
      FROM (SELECT subTblSlides.BlockID AS subBlockID, subTblSlideDistribution.SlideDistributionLocation
              FROM tblSlides as subTblSlides
              INNER JOIN   tblSlideDistribution as subTblSlideDistribution on subTblSlides.SlideDistributionID = subTblSlideDistribution.SlideDistributionID
              WHERE subTblSlideDistribution.DTReadyForCourier > funPreviousWorkDayCutoffDateTime()
              GROUP BY subTblSlides.BlockID, SlideDistributionLocation) as qrySubBlockCountWLocation
      INNER JOIN tblSlideDistributionLocations on SlideDistributionLocation = tblSlideDistributionLocations.LocationID
      GROUP BY SlideDistributionLocation
      ORDER BY tblSlideDistributionLocations.SortValue;`
      break

    case 'BlockCountAllRunTimesBySortVal':
      // console.log('Hello report block count')

      strSQL = `/*qryBlockCountAllRunTimesBySortVal*/
      SELECT 
        LocAbbr,
        FirstRunBlockCount,
        SecondRunBlockCount,
        ThirdRunBlockCount,
        FourthRunBlockCount,
        TotalBlockCount
      FROM
        qryBlockCountAllRunTimesBySortVal;`
      break

    case 'LoadBlockCutsLine':
      // console.log('Hello report block count')

      strSQL = `/*qryDailyBlockCountNumberedByCuttingTime*/
      SET @rownum:=0;
      SELECT @rownum:=(@rownum+1) as BlockCutSeq, tblActionTracking.IDOfMaterial, MIN(tblActionTracking.ActionDateTime) AS FirstOfActionDateTime
      FROM tblActionTracking
      WHERE tblActionTracking.Action="SlidesPrintedOffBlock" AND
      tblActionTracking.Count>0 AND
      ActionDateTime >= funPreviousWorkDayCutoffDateTime()
      GROUP BY tblActionTracking.IDOfMaterial
      ORDER BY FirstOfActionDateTime;

      /*qryDailyBlockCountNumberedBySlideDistrTime*/
      SET @rownum:=0;
      SELECT @rownum:=(@rownum+1) as BlockDistSeq, subTblSlides.BlockID AS subBlockID, subTblSlideDistribution.SlideDistributionLocation, MIN(subTblSlideDistribution.DTReadyForCourier) as FirstDTReadyForCourier
              FROM tblSlides as subTblSlides
              INNER JOIN   tblSlideDistribution as subTblSlideDistribution on subTblSlides.SlideDistributionID = subTblSlideDistribution.SlideDistributionID
              WHERE subTblSlideDistribution.DTReadyForCourier >= funPreviousWorkDayCutoffDateTime()
      group by subTblSlides.BlockID, subTblSlideDistribution.SlideDistributionLocation
      order by FirstDTReadyForCourier, BlockDistSeq;

      /*qryDailyEmbeddedTime*/
      SET @rownum:=0;
      SELECT @rownum:=(@rownum+1) as EmbeddedSeq, tblActionTracking.IDOfMaterial, MIN(tblActionTracking.ActionDateTime) AS FirstOfEmbeddedActionDateTime
      FROM tblActionTracking
      WHERE tblActionTracking.Action LIKE "%Embedded%"  AND
      ActionDateTime >= funPreviousWorkDayCutoffDateTime()
      GROUP BY tblActionTracking.IDOfMaterial
      ORDER BY FirstOfEmbeddedActionDateTime;`
      break


    case 'EstimatedBlockCount':

      strSQL = `/*qryEstimatedBlockCount.sql*/
      SET @varBlockDTEngravedGreaterThan = '2019-12-16 22:00';
      SET @varBlockDTEngravedLessThanEqualTo = '2019-12-17 22:00';
      SET @varHoldOverBlockDTEngravedGreaterThan = '2019-12-15 22:00';
      SET @varHoldOverBlockDTEngravedLessEgualToThan = '2019-12-16 22:00';
      
      SELECT COUNT(BlockID) as 'EstimatedBlocks'
      FROM OPENLIS.tblBlock where
      (tblBlock.Cancelled is null OR tblBlock.Cancelled = 0) AND
      (
          ((tblBlock.Holdover is null OR tblBlock.Holdover = 0) AND
        DateTimeEngraved > @varBlockDTEngravedGreaterThan AND DateTimeEngraved <= @varBlockDTEngravedLessThanEqualTo) 
        OR
        (
         tblBlock.Holdover = 1 AND
         DateTimeEngraved > @varHoldOverBlockDTEngravedGreaterThan AND DateTimeEngraved <= @varHoldOverBlockDTEngravedLessEgualToThan
        )
      )`
      break

    default:
      break
  }
  //  console.log(strSQL)

  if (strSQL !== null) {
  // Connect to the database
    var con = mysql.createConnection(mysqlConfig)
    con.query(strSQL, function (err, result) {
      if (err) {
        response.send(err)
        console.log(err)
      // On Error, close connection
      } else {
      // if there is no error, you have the result
        response.json(result)
      }
      con.end()
    })
  }
}
