const ExcelJS = require('exceljs');
const { Op } = require("sequelize");
const candidate = require('../../routers/candidate');
function date(d) {
  if(d instanceof Date) return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}.`;
}

function time(d) {
  if(d instanceof Date) return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}
function columnToLetter(column)
{
  var temp, letter = '';
  while (column > 0)
  {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}
function AdjustColumnWidth(worksheet) {
  worksheet.columns.forEach(column => {
    const lengths = column.values.map(v => v.toString().length);
    const maxLength = Math.max(...lengths.filter(v => typeof v === 'number'));
    column.width = maxLength;
  });
}
module.exports = async (sequelize, group, startDate, endDate, minimalAttendance, details) => {
  var attendanceRegistry=[];
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "MisEnapló"
  workbook.lastModifiedBy = "MisEnapló"
  const sheet = workbook.addWorksheet("Jelenléti ív", {
    pageSetup: {
      paperSize: 9, orientation: 'landscape'
    }
  });
  sheet.state = 'visible';

  var candidates = await group.getCandidates({
    through: {
      attributes: []
    },
    attributes: ["name", "id"],
    include: [{
      model: sequelize.models.Attendance,
      attributes: ["createdAt"],
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate+" 23:59:59"]
        }
      },
      required: minimalAttendance>0
    }]
  })
  candidates = candidates.map(c => c.toJSON()).filter(c => c.Attendances.length>=minimalAttendance).sort((a,b) => {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  });

  //2. fejlécsor
  sheet.getCell(`${columnToLetter(1)}2`).value="Név";
  sheet.getCell(`${columnToLetter(1)}2`).alignment={horizontal: 'center'};
  sheet.getCell(`${columnToLetter(1)}2`).border = {
    top: {style:'thick'},
    left: {style:'thick'},
    bottom: {style:'thin'},
    right: {style:'thick'}
  };

  sheet.getCell(`${columnToLetter(2)}2`).value="Összes jelenlét"
  sheet.getCell(`${columnToLetter(2)}2`).alignment={horizontal: 'center'};
  sheet.getCell(`${columnToLetter(2)}2`).border = {
    top: {style:'thick'},
    left: {style:'thick'},
    bottom: {style:'thin'},
    right: {style:'thick'}
  };
  
  if(details) {
    for(var i = 0; i<candidates.length;i++) {
      for(var j = 0; j<candidates[i].Attendances.length;j++) {
        var index = attendanceRegistry.findIndex(aR => aR.date == date(candidates[i].Attendances[j].createdAt));
        if(index==-1) 
          attendanceRegistry.push({
            date: date(candidates[i].Attendances[j].createdAt),
          })
        attendanceRegistry[index==-1 ? attendanceRegistry.length-1 : index][candidates[i].id]= attendanceRegistry[index==-1 ? attendanceRegistry.length-1 : index][candidates[i].id] ? `${attendanceRegistry[index==-1 ? attendanceRegistry.length-1 : index][candidates[i].id]}, ${time(candidates[i].Attendances[j].createdAt)}` : time(candidates[i].Attendances[j].createdAt) 
      }
    }

    attendanceRegistry = attendanceRegistry.sort((a, b) => {
      const dateA = new Date(Date.parse(a.date)), dateB = new Date(Date.parse(b.date));
      if (dateA < dateB) {
        return -1;
      }
      if (dateA > dateB) {
        return 1;
      }
      return 0;
    })
    for(var i = 0; i<attendanceRegistry.length;i++) {
      sheet.getCell(`${columnToLetter(3+i)}2`).value= `${attendanceRegistry[i].date}`;
      sheet.getCell(`${columnToLetter(3+i)}2`).alignment = {horizontal: 'center'};
      sheet.getCell(`${columnToLetter(3+i)}2`).border = {
        top: {style:'thick'},
        left: {style:'thick'},
        bottom: {style:'thin'},
        right: {style:'thick'}
      };
    }
  }


  for(var i = 0;i<candidates.length;i++) {
    sheet.getCell(`${columnToLetter(1)}${3+i}`).value=`${candidates[i].name}`;
    sheet.getCell(`${columnToLetter(1)}${3+1}`).border = {
      top: {style:'thin'},
      left: {style:'thin'},
      bottom: {style:'thin'},
      right: {style:'thin'}
    };
    sheet.getCell(`${columnToLetter(2)}${3+i}`).value=`${candidates[i].Attendances.length}`;
    sheet.getCell(`${columnToLetter(2)}${3+i}`).alignment = {horizontal: 'center'};

    sheet.getCell(`${columnToLetter(2)}${3+1}`).border = {
      top: {style:'thin'},
      left: {style:'thin'},
      bottom: {style:'thin'},
      right: {style:'thin'}
    };

    if(details) {
      for(var j = 0;j<attendanceRegistry.length;j++) {
        sheet.getCell(`${columnToLetter(3+j)}${3+i}`).value= attendanceRegistry[j][candidates[i].id]||"";
        sheet.getCell(`${columnToLetter(3+j)}${3+i}`).fill = {
          type: 'pattern',
          pattern:'solid',
          fgColor:{argb: attendanceRegistry[j][candidates[i].id] ? '42F551' : 'FFFF0000'},
        }
        sheet.getCell(`${columnToLetter(3+j)}${3+i}`).border = {
          top: {style:'thin'},
          left: {style:'thick'},
          bottom: {style:'thin'},
          right: {style:'thick'}
        };
        sheet.getCell(`${columnToLetter(3+j)}${3+i}`).alignment =  {horizontal: 'center'};
      }
    }

  }



  AdjustColumnWidth(sheet);
  //1. fejlécsor
  sheet.mergeCells(`${columnToLetter(1)}1:${columnToLetter(details?attendanceRegistry.length+2:2)}1`);
  sheet.getCell(`${columnToLetter(details?attendanceRegistry.length+2:2)}1`).value = `${group.name} miserészvételi adatok (${startDate.replace(/-/g,".")}. - ${endDate.replace(/-/g,".")}.)`;
  sheet.getCell(`${columnToLetter(1)}1`).alignment = {horizontal: 'center'};
  sheet.getCell(`${columnToLetter(1)}1`).border = {
    top: {style:'thin'},
    left: {style:'thick'},
    bottom: {style:'thick'},
    right: {style:'thick'}
  };

  const fileBuffer = await workbook.xlsx.writeBuffer()
  return fileBuffer;
}
