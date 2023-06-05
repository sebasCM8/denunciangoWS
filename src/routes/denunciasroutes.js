const express = require("express");
const ResponseResult = require("../models/responseresult");
const DenunciaCtrl = require("../controllers/denunciasCtrl");
const router = express.Router();
const DenunciaController = require("../controllers/denunciaCtrl");

const { storage } = require("../database/cloudStorage");
const { ref, uploadString, getDownloadURL } = require("firebase/storage");

const axios = require("axios");

//SAVES BASE64 AS A TXT FILE
router.post("/uploadImg", async function (req, res) {
  var response = new ResponseResult();

  try {
    var imgName = req.body.name + ".txt";
    const storageRef = ref(storage, imgName);
    await uploadString(storageRef, req.body.img).then((snapshot) => {
      //console.log("base64 img String uploaded, snapshot obj: ");
      //console.log(snapshot);
    });
    response.ok = true;
    response.msg = "Test ejecutado correctamente";
  } catch (e) {
    response.ok = false;
    response.msg = "Excepcion: " + e;
  }

  return res.status(200).send(response.getResponseData());
});

router.post("/downloadImg", async function (req, res) {
  var response = new ResponseResult();
  var txtImg = "";
  try {
    var imgName = req.body.name + ".txt";
    const storageRef = ref(storage, imgName);
    var url = await getDownloadURL(storageRef);
    //console.log("FILE URL: " + url);

    await axios
      .get(url)
      .then((response) => {
        //console.log(response.data);
        txtImg = response.data;
      })
      .catch((error) => {
        console.error(error);
      });

    response.ok = true;
    response.data = txtImg;
    response.msg = "Test ejecutado correctamente";
  } catch (e) {
    response.ok = false;
    response.msg = "Excepcion: " + e;
  }

  return res.status(200).send(response.getResponseData());
});



router.get("/denunciaPaso1", async function (req, res) {
  var response = new ResponseResult();
  try {
    response = await DenunciaCtrl.denunciaPaso1("Quiero hacer una denuncia acerca de mi calle, esta con baches ya hace un mes, y no nos dan una solución. negro"
    );

  } catch (e) {
    response.ok = false;
    response.msg = "Excepcion en denuncia paso 1: " + e;
  }
  return res.status(200).send(response.getResponseData());
});


router.get("/denunciaPaso2", async function (req, res) {
  var response = new ResponseResult();
  try {
    const fs = require("fs");
    const img = fs.readFileSync("imgns/i1.jpg").toString("base64");
    response = await DenunciaCtrl.denunciaPaso2(img);
  } catch (e) {
    response.ok = false;
    response.msg = "Excepcion en denuncia paso 2: " + e;
  }
  return res.status(200).send(response.getResponseData());
});

router.get("/tiposDenuncia", async function (req, res) {
    var response = new ResponseResult();

    try {
        response = await DenunciaController.obtenerTipoDenuncia();
    } catch (e) {
        response.ok = false;
        response.msg = "Excepcion: " + e;
    }

    return res.status(200).send(response.getResponseData());
});

router.post("/registrarDenuncia", async function (req, res) {
    var response = new ResponseResult();

    try {
        response = await DenunciaController.registrarDenuncia(req.body);
    } catch (e) {
        response.ok = false;
        response.msg = "Excepcion: " + e;
    }

    return res.status(200).send(response.getResponseData());
});

router.post("/usuarioDenuncias", async function (req, res) {
    var response = new ResponseResult();

    try {
        response = await DenunciaController.obtenerDenunciasUsu(req.body.usuEmail);
    } catch (e) {
        response.ok = false;
        response.msg = "Excepcion: " + e;
    }

    return res.status(200).send(response.getResponseData());
});


router.post("/obtenerDetDen", async function (req, res) {
    var response = new ResponseResult();

    try {
        response = await DenunciaController.obtenerDetalleDenuncia(req.body.denId);
    } catch (e) {
        response.ok = false;
        response.msg = "Excepcion: " + e;
    }

    return res.status(200).send(response.getResponseData());
});


module.exports = router;
