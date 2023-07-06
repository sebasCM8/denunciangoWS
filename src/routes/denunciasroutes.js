const express = require("express");
const ResponseResult = require("../models/responseresult");
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

router.get("/obtenerEstadosDenuncia", async function (req, res) {
  var response = new ResponseResult();
  try {
    response = await DenunciaController.obtenerEstadosDenuncia();
  } catch (e) {
    response.ok = false;
    response.msg = "Excepcion: " + e;
  }
  return res.status(200).send(response);
});

router.get("/obtenerDenuncias", async function (req, res) {
  var response = new ResponseResult();
  try {
    response = await DenunciaController.obtenerDenuncias();
  } catch (e) {
    response.ok = false;
    response.msg = "Excepcion: " + e;
  }
  return res.status(200).send(response);
});


router.post("/propietarioDen", async function (req, res) {
  var response = new ResponseResult();

  try {
    response = await DenunciaController.obtenerPropietarioDen(req.body.usuEmail);
  } catch (e) {
    response.ok = false;
    response.msg = "Excepcion: " + e;
  }

  return res.status(200).send(response.getResponseData());
});

router.post("/denRechazarDen", async function (req, res) {
  var response = new ResponseResult();

  try {
    response = await DenunciaController.rechazarDenuncia(req.body);
  } catch (e) {
    response.ok = false;
    response.msg = "Excepcion al rechazar den: " + e;
  }
  return res.status(200).send(response);
});

router.post("/denAceptarDen", async function (req, res) {
  var response = new ResponseResult();

  try {
    response = await DenunciaController.aceptarDenuncia(req.body);
  } catch (e) {
    response.ok = false;
    response.msg = "Excepcion al rechazar den: " + e;
  }
  return res.status(200).send(response);
});

module.exports = router;
