var fs = require('fs')
require('http').request()
var newdata = [];
const path = 'log.txt'
//---delete file
if (fs.existsSync(path)) 
{
    try {
        fs.unlinkSync(path)
    } catch(err) 
    {
        console.error(err)
    }
}
//***** */
var Connection = require('tedious').Connection;  
var config = {  
    server: '192.168.100.28',  //update me
    authentication: {
        type: 'default',
        options: {
            userName: 'rcdadmin',
            password: 'rcd2017$',
            encrypt: false,
            trustServerCertificate: true
        }
    },
    options: {
        // If you are on Microsoft Azure, you need encryption:
        encrypt: true,
        trustServerCertificate: true,
        database: 'cit_kun'  //update me
    }
}; 
var connection = new Connection(config);  
    connection.on('connect', function(err) {  
    // If no error, then good to proceed.  
    console.log("Connected");  
    //console.log( executeStatement('select Account1 as Account_,tcreatedFilter from [dbo].[CPN] where Account1=0421132313') );
    executeStatement("select Account1,REPLACE(CONVERT(CHAR(10), tcreatedFilter, 103), '-', '') as tcreatedFilter,SumofBanknotes_GDM, * from [dbo].[CPN] where Account1=0421132313")
});  
connection.connect();
//********************************************** */
const formatData = (input) => {
    if (input > 9) {
      return input;
    } else return `0${input}`;
  };
function executeStatement(sql_) {      
    let request = new Request(sql_, function(err) {  
    if (err) {  
        console.log(err);}  
    else
    {
        //----format date--
        let today = new Date();
        let yyyy = today.getFullYear();
        let mm = today.getMonth() + 1; // Months start at 0!
        let dd = today.getDate();
        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;
        let today_ = dd  + mm +  yyyy;
        let TotlSumofBanknotes_GDM=0
        //----Time
        let time
        time = formatData(today.getHours()) + formatData(today.getMinutes())
        //----write file--
        var logger = fs.createWriteStream('CPN_'+today_+time+'.txt', {
        flags: 'a' // 'a' means appending (old data will be preserved)
        })
        let rowall = newdata.length
        //console.log( newdata[1][2] )
        logger.write('1  ') // append string to your file
        logger.write( newdata[0][0] ) // append string to your file
        logger.write( '                    Citibank                      ' + today_+time+'TH0000000000' )
        logger.write( '\n'+'2          CENTRAL   Citibank' )
        for (let i = 1; i <= newdata.length; i++) {
            logger.write( '\n'+'5          00000000                '+i+'Citibank' )
            logger.write( '\n'+'600000000                '+i+'    100000000            CASH 004                                     THBCSH       '+today_+'         '+newdata[i-1][2]+'          0004            000                   00000000000000000                                                                                   400600000000000000                                                                        004                 400600000000000000                                                                                                                                                                                                                                                                                                                                                                                                                  53000219002270222   K0XX0813K0XXXXXX00000000                                                                                                         27022022                              004                                                                  '+newdata[i-1][2] )           
            logger.write( '\n'+'7          00000000                ' + i + '            ' + newdata[i-1][2] )
            TotlSumofBanknotes_GDM += parseFloat( newdata[i-1][2] )
        }
        logger.write( '\n'+'8                    '+(Math.round( TotlSumofBanknotes_GDM * 100) / 100).toFixed(2) )
        logger.write( '\n'+'9    '+(rowall+4) )
        logger.on('finish', () => {
            console.log('wrote all data to file');
        });
    }
    });  
    var result = "";
    request.on('row', function(columns) {  
        let o = {};
        //for (let i in columns) { 
            o = [columns[0].value,columns[1].value,( Math.round( columns[2].value * 100 ) / 100 ).toFixed( 2 )];
            newdata.push(o);
        //}
        //console.log(o);
        // myReturn.push(o);
        // result+= columns[0].value+" "+columns[1].value + " ";  
        // newdata.push( columns[0].value+" "+columns[1].value + " " );
        // columns.forEach(function(column) {  
        //   if (column.value === null) {  
        //     console.log('NULL');  
        //   } else {  
        //     result+= column.value + " ";  
        //   }  
        // });  
        //console.log(result);  
        //result ="";  
    });  
    //resolve(newdata);
    request.on('done', function(rowCount, more) {  
    console.log(rowCount + ' rows returned');  
    });    
    // Close the connection after the final event emitted by the request, after the callback passes
    request.on("requestCompleted", function (rowCount, more) {
        connection.close();
    });
    connection.execSql(request);      
}  