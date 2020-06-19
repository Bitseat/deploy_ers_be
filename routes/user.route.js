let express = require('express'),
  multer = require('multer'),
  mongoose = require('mongoose'),
  router = express.Router();

// Multer File upload settings
const DIR = './public/';
const path = require('path');
//const {spawn} = require('child_process');
var fs = require('fs');
const fse = require('fs-extra')
//var spawn = require('child-process-promise').spawn;
//var exec = require('child-process-promise').exec;
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(' ').join('-');
    cb(null, fileName)
  }
});

var upload = multer({
  storage: storage,
  // limits: {
  //   fileSize: 1024 * 1024 * 5
  // },
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "application/pdf" || 
    file.mimetype == "application/msword" || 
    file.mimetype == "application/vnd.openxmlformats-officedocument.wordprocessing" || 
    file.mimetype == "application/doc" || 
    file.mimetype == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
    file.mimetype == "application/ms-doc") {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only image, word and pdf format allowed!'));
    }
  }
});

// User model
let User = require('../models/User');

router.post('/create-user', upload.array('avatar', 6), (req, res, next) => {
  const reqFiles = []
  const url = req.protocol + '://' + req.get('host')
  for (var i = 0; i < req.files.length; i++) {
    reqFiles.push(url + '/public/' + req.files[i].filename)
  }

  var ncp = require('ncp');
 
  ncp.limit = 16;

  ncp('./public', './resumes', function (err) {
    if (err) {
      return console.error(err);
    }
    console.log('done!');
    });

  ncp('./public', './temp', function (err) {
    if (err) {
      return console.error(err);
    }
    console.log('done!');
  });

  // exec('python3' + ' ' + path.join(__dirname, '../extract_resume_info4.py'))
  //   .then(function (result) {
  //       var stdout = result.stdout;
  //       var stderr = result.stderr;
  //       console.log('stdout: ', stdout);
  //       console.log('stderr: ', stderr);
  //   })
  //   .catch(function (err) {
  //       console.error('ERROR: ', err);
  //   });
  

  async function runScript() {
    const { stdout, stderr } = await exec('python3' + ' ' + path.join(__dirname, '../extract_resume_info_final.py'));
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
  }

  runScript();

  // runScript = async () => {
  // return await spawn('python3', [
  //     "-u", 
  //     path.join(__dirname, '../extract_resume_info4.py'),
  // ]);
  // }

  // const subprocess = setTimeout(() => {runScript()}, 20000);
  // print output of script
  // subprocess.stdout.on('data', (data) => {
  //   console.log(`data:${data}`);
  // });
  // subprocess.stderr.on('data', (data) => {
  //   console.log(`error:${data}`);
  // });
  // subprocess.on('close', () => {
  //   console.log("Closed");
  // });


    
  // runScript()
  // var promise = spawn('python3', [
  //   "-u", 
  //   path.join(__dirname, '../extract_resume_info2.py'), ]);

  // var childProcess = promise.childProcess;

  // console.log('[spawn] childProcess.pid: ', childProcess.pid);
  // childProcess.stdout.on('data', function (data) {
  //     console.log('[spawn] stdout: ', data.toString());
  // });
  // childProcess.stderr.on('data', function (data) {
  //     console.log('[spawn] stderr: ', data.toString());
  // });
  
  // promise.then(function () {
  //         console.log('[spawn] done!');
  //     })
  //     .catch(function (err) {
  //         console.error('[spawn] ERROR: ', err);
  //     });

  // spawn('python3', [
  //   "-u", 
  //   path.join(__dirname, '../extract_resume_info4.py'), ], { capture: [ 'stdout', 'stderr' ]})
  // .then(function (result) {
  //     console.log('[spawn] stdout: ', result.stdout.toString());
  // })
  // .catch(function (err) {
  //     console.error('[spawn] stderr: ', err.stderr);
  // });    

  for (var i = 0; i < reqFiles.length; i++) {

    console.log(reqFiles[i])
    //var file_path = reqFiles[i]

    var uploaded_file_name = req.files[i].filename
    console.log(uploaded_file_name)
    console.log(uploaded_file_name.slice(0,uploaded_file_name.lastIndexOf('.')));
    // var new_avatar = (url + '/pdfs/' + uploaded_file_name.slice(0,uploaded_file_name.lastIndexOf('.')) + '.pdf')
    //var new_avatar = (path.resolve(__dirname, '../pdfs/'+uploaded_file_name.slice(0,uploaded_file_name.lastIndexOf('.'))+'.pdf'))
    let rawdata



    if(!fs.existsSync(path.join(__dirname, '../jsons/'+uploaded_file_name+'.json'))) {
        console.log("File not found");
      }
  
    else {
        rawdata = fs.readFileSync(path.resolve(__dirname, '../jsons/'+uploaded_file_name+'.json'));
        var new_avatar = (url + '/pdfs/' + uploaded_file_name.slice(0,uploaded_file_name.lastIndexOf('.')) + '.pdf')
        let applicant = JSON.parse(rawdata);
        console.log(applicant['name']);
    
        const user = new User({
        _id: new mongoose.Types.ObjectId(),
        avatar: new_avatar,
        name: applicant['name'],
        email: applicant['email'],
        mobile_number: applicant['mobile_number'],
        skills: applicant['skills'],
        college_name: applicant['college_name'],
        degree: applicant['degree'],
        designation: applicant['designation'],
        experience: applicant['experience'],
        company_names: applicant['company_names'],
        total_experience: applicant['total_experience'],
        });
        user.save().then(result => {
          console.log(result);
          res.status(201).json({
            message: "Done upload!",
            userCreated: {
              _id: result._id,
              avatar: result.avatar,
              name: result.name,
              email: result.email,
              mobile_number: result.mobile_number,
              skills: result.skills,
              college_name: result.college_name,
              degree: result.degree,
              designation: result.designation,
              experience: result.experience,
              company_names: result.company_names,
              total_experience: result.total_experience,
      
            }
          })
        }).catch(err => {
          console.log(err),
            res.status(500).json({
              error: err
            });
        }); 
      }

  }

// router.get("/", (req, res, next) => {
//   User.find().then(data => {
//     res.status(200).json({
//       message: "User list retrieved successfully!",
//       users: data
//     });
//   });
// });


router.get("/", async (req, res, next) => {
  try {
  //listing messages in users mailbox 
    User.find().then(data => {
      res.status(200).json({
        message: "User list retrieved successfully!",
        users: data
      });
    });
  } catch (err) {
    next(err);
  }
})




})

module.exports = router;