const fs = require('fs')
const path = require('path')
const { Connection, Request } = require("tedious")
const raw = fs.readFileSync('./csv/CPN.csv', 'utf8')
const data = raw.split(/\r?\n/)

let dataall = data.length - 1
var sSql = ""
var value_ = ""
var logger
var content_h = ""
var content_d = ""
var content_f = ""
// var existingFile = false
// var newdata = []

//CIT_ReportDB_GFCCP 192.168.100.176 sa ahost!1234
//joining path of directory 
const directoryPath = path.join(__dirname, 'output');
var file_
//passsing directoryPath and callback function
fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err)
    }
    //listing all files using forEach
    // files.forEach(function (file) {
    //     // Do whatever you want to do with the file
    //     existingFile = true
    //     console.log(file)
    //     file_ = file
    // });
});
const executeSQL = (sql, callback) => {
    let connection = new Connection({
        "authentication": {
            "options": {
                "userName": "sa",
                "password": "ahost!1234"
            },
            "type": "default"
        },
        "server": "192.168.100.176",
        "options": {
            "validateBulkLoadParameters": false,
            "rowCollectionOnRequestCompletion": true,
            "database": "CIT_ReportDB_GFCCP",
            "encrypt": false,
            "trustServerCertificate": true
        }
    })
    connection.connect((err) => {
        if (err)
            return callback(err, null)
        const request = new Request(sql, (err, rowCount, rows) => {
            connection.close()
            if (err)
                return callback(err, null)
            callback(null, { rowCount, rows })
        })
        connection.execSql(request)
    })
}
const formatData = (input) => {
    if (input > 5) {
        return input
    } else return `0${input}`
}
for (let i = 1; i <= dataall; i++) {
    sSql = "INSERT INTO [dbo].[CPN_Data] ([Depositor],[PayIn],[TaxId],[Suffix],[Account],[Ref_1],[Ref_2],[RecDate],[CreateDate],[CreateBy],"
    sSql += "[Status]) VALUES ("
    let dataArray = data[i].split(",")
    value_ = "'" + dataArray[0] + "'"
    value_ += ",'" + dataArray[1] + "'"
    value_ += ",'" + dataArray[2] + "'"
    value_ += ",'" + dataArray[3] + "'"
    value_ += ",'" + dataArray[4] + "'"
    value_ += ",'" + dataArray[5] + "'"
    value_ += ",'" + dataArray[6] + "'"
    value_ += ",'" + formatData(dataArray[7]) + "'"
    value_ += ",GETDATE()"
    value_ += ",'GFCTH'"
    value_ += ",'1'"
    sSql += value_ + ")"
    //    executeSQL(sSql, (err, data) => {
    //         if (err)
    //             console.error(err)
    //         //console.log(data.rowCount)
    //     })
}

const executeSQL_Select_Groupby = (sql, callback) => {
    let connection = new Connection({
        "authentication": {
            "options": {
                "userName": "sa",
                "password": "ahost!1234"
            },
            "type": "default"
        },
        "server": "192.168.100.176",
        "options": {
            "validateBulkLoadParameters": false,
            "rowCollectionOnRequestCompletion": true,
            "database": "CIT_ReportDB_GFCCP",
            "encrypt": false,
            "trustServerCertificate": true
        }
    })
    let newdata = []
    connection.connect((err) => {
        if (err)
            return callback(err, null)
        const request = new Request(sql, (err, rowCount, rows) => {
            connection.close()
            if (err) {
                return callback(err, null)
            }
            else {
                //----code command after excute sql----------------
                if (newdata.length > 0) {
                    //requiring path and fs modules
                    // const testFolder = './output/';
                    // fs.readdir(testFolder, (err, files) => {
                    //     files.forEach(file => {
                    //         filenum++
                    //         console.log(file)
                    //         file_ = file
                    //     })
                    // })
                    let today_
                    let time
                    //----format date--
                    let today = new Date();
                    let yyyy = today.getFullYear();
                    let mm = today.getMonth() + 1; // Months start at 0!
                    let dd = today.getDate();
                    if (dd < 10) dd = '0' + dd;
                    if (mm < 10) mm = '0' + mm;
                    today_ = dd + mm + yyyy;
                    let TotlSumofBanknotes_GDM = 0
                    //----Time    
                    time = formatData(today.getHours()) + formatData(today.getMinutes())
                    // if (existingFile === false) {
                    //     file_ = 'CPN_' + today_ + time + '.txt'
                    //     // logger = fs.createWriteStream('./output/' + file_, {
                    //     //     flags: 'a' // 'a' means appending (old data will be preserved)
                    //     // })
                    // }
                    console.log('newdata0' + newdata.length)
                    let iNum = 0
                    newdata.forEach(element => {
                        file_ = 'CPN_' + element + '_' + today_ + time + '.txt'
                        content_h = ""
                        content_d = ""
                        content_f = ""
                        sSql = "select Account,PayIn from [dbo].[CPN_Data] where Account='" + element + "' order by id "
                        //console.log(sSql)

                        iNum++
                        executeSQL_Select(sSql, file_, today_, time, TotlSumofBanknotes_GDM, iNum, element)
                        // if (existingFile === false) existingFile = true
                    })
                }
            }
        })
        connection.execSql(request)
        request.on('row', function (columns) {
            //let o = {}
            for (let i in columns) {
                // o = [columns[0].value]
                newdata.push(columns[0].value)
            }
        })
    })
}
const executeSQL_Select = (sql, file_, today_, time, TotlSumofBanknotes_GDM, iNum, account, callback) => {
    let connection = new Connection({
        "authentication": {
            "options": {
                "userName": "sa",
                "password": "ahost!1234"
            },
            "type": "default"
        },
        "server": "192.168.100.176",
        "options": {
            "validateBulkLoadParameters": false,
            "rowCollectionOnRequestCompletion": true,
            "database": "CIT_ReportDB_GFCCP",
            "encrypt": false,
            "trustServerCertificate": true
        }
    })
    //let newdata = []
    let account_ = ""
    let i = 0
    connection.connect((err) => {
        if (err)
            return callback(err, null)
        const request = new Request(sql, (err, rowCount, rows) => {
            // connection.close()
            if (err) {
                return callback(err, null)
            }
            else {
                //----code command after excute sql----------------
                // logger = fs.createWriteStream('./output/' + file_, {
                //     flags: 'a' // 'a' means appending (old data will be preserved)
                // })
                // try {
                //     if (existingFile === false) {
                //         logger.write('1  ') // append string to your file
                //     }
                //     else {
                //         logger.write('\n' + '1  ') // append string to your file
                //     }
                //     console.log(newdata.length)
                //     let rowall = newdata.length
                //     logger.write(account) // append string to your file
                //     logger.write('                    Citibank                      ' + today_ + time + 'TH0000000000')
                //     logger.write('\n' + '2          CENTRAL   Citibank')
                //     console.log('newdata[0]'+newdata[0])
                //     console.log('newdata[1]'+newdata[1])
                //     console.log('newdata[0][1]'+newdata[0][1])
                //     console.log('newdata[1][1]'+newdata[1][1])
                //     for (let i = 1; i <= newdata.length; i++) {
                //         logger.write('\n' + '5          00000000                ' + i + 'Citibank')
                //         logger.write('\n' + '600000000                ' + i + '    100000000            CASH 004                                     THBCSH       ' + today_ + '         ' + newdata[1] + '          0004            000                   00000000000000000                                                                                   400600000000000000                                                                        004                 400600000000000000                                                                                                                                                                                                                                                                                                                                                                                                                  53000219002270222   K0XX0813K0XXXXXX00000000                                                                                                         27022022                              004                                                                  ' + newdata[1])
                //         logger.write('\n' + '7          00000000                ' + i + '            ' + newdata[1])
                //         TotlSumofBanknotes_GDM += parseFloat(newdata[1])
                //     }
                console.log('iNum=' + iNum)
                content_f += '\n' + '8                    ' + (Math.round(TotlSumofBanknotes_GDM * 100) / 100).toFixed(2)
                content_f += '\n' + '9    ' + (i + 6)
               // console.log('i in const request = new Request(sql, (err, rowCount, rows)' + i)
                logger = fs.createWriteStream('./output/' + file_, {
                    flags: 'a' // 'a' means appending (old data will be preserved)
                })
                logger.write(content_h + content_d + content_f)
                logger.on('finish', () => {
                    console.log('wrote all data to file')

                });
                //     // console.log('done', existingFile)
                // } catch (err) {
                //     console.error(err)
                // }                
            }
        })
        //******************** */
        // logger = fs.createWriteStream('./output/' + file_, {
        //     flags: 'a' // 'a' means appending (old data will be preserved)
        // })
        //********************* */
        request.on('row', function (columns) {
            //---code command excute sql-----------            
            //  console.log(sql)
            if (account_ === "") {

                try {
                    // if (existingFile === false) {
                    //     logger.write('1  ') // append string to your file
                    // }
                    // else {
                    //     logger.write('\n' + '1  ') // append string to your file
                    // }
                    content_h = '1  '
                    content_h += account // append string to your fil
                    content_h += '                    Citibank                      ' + today_ + time + 'TH0000000000'
                    content_h += '\n' + '2          CENTRAL   Citibank'
                } catch (err) {
                    console.error(err)
                }

            }
           // console.log(i)
           // console.log(columns[0].value, columns[1].value)
            // for (let i in columns) {
            // o = [columns[0].value]
            // newdata.push(columns[0].value, columns[1].value)
            // }
            // for (let i = 1; i <= newdata.length; i++) {
            content_d += '\n' + '5          00000000                ' + i + 'Citibank'
            content_d += '\n' + '600000000                ' + i + '    100000000            CASH 004                                     THBCSH       ' + today_ + '         ' + columns[1].value + '          0004            000                   00000000000000000                                                                                   400600000000000000                                                                        004                 400600000000000000                                                                                                                                                                                                                                                                                                                                                                                                                  53000219002270222   K0XX0813K0XXXXXX00000000                                                                                                         27022022                              004                                                                  ' + columns[1].value
            content_d += '\n' + '7          00000000                ' + i + '            ' + columns[1].value
            TotlSumofBanknotes_GDM += parseFloat(columns[1].value)
            i++
            //}
        })
        //********** */

        // logger.write('\n' + '8                    ' + (Math.round(TotlSumofBanknotes_GDM * 100) / 100).toFixed(2))
        // logger.write('\n' + '9    ' + (i + 4))
        // logger.on('finish', () => {
        //     console.log('wrote all data to file');
        // });
        //***************** */
        request.on('done', function (rowCount, more) {
            console.log(rowCount + ' rows returned')
        });
        request.on("requestCompleted", function (rowCount, more) {
            logger = null
            content_h = ""
            content_d = ""
            content_f = ""
            connection.close()
        });
        connection.execSql(request)
    })
}
sSql = "select Account from vCPN_Data_GroupBy_Acc"
executeSQL_Select_Groupby(sSql, (err, data) => {
    if (err)
        console.error(err)
})








