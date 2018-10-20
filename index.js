const express = require('express');
const multer = require('multer');
const morgan = require('morgan');
const {sequelize} = require(`./models/index`);
let fs = require(`fs`);
let PDFParser = require(`pdf2json`);

let app = express();

app.set(`view engine`, `ejs`);
app.use(express.static(`public`));

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `./uploads`);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if(file.mimetype === `application/pdf`){
    cb(null, true);
  } else {
    console.log(`not the file we want to upload`);
  }

}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});


app.get(`/`, (req, res) => {
  res.render(`home`);
});

app.post(`/file`, upload.single('avatar'), (req, res, next) => {
  console.log(req.file);

  let pdfParser = new PDFParser(this, 1);

  pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
    pdfParser.on("pdfParser_dataReady", pdfData => {
        fs.writeFile("./PDFtoTXT/" + req.file.originalname.replace('.pdf', '.txt'), pdfParser.getRawTextContent(), ()=> {
          console.log(`done`);
        });

        sequelize.query(
          `INSERT INTO structured_files (file_name, structured_pdf) VALUES (:file, :pdf)`,
          {
            replacements: {
              file: req.file.originalname,
              pdf: pdfParser.getRawTextContent()
            }
          }
        ).then(result => {
          res.status(201).json({
            message: `File is stored in database`
          });
        }).catch(err => {
          res.status(500).json({
            message: err
          })
        });
    });

    pdfParser.loadPDF("./uploads/"+ req.file.originalname);
});

app.listen(3000);
