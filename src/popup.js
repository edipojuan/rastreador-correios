'use strict';

const PROXY_URL = 'https://proxier.now.sh';

function load() {
  const btnSearch = document.getElementById('search');

  btnSearch.addEventListener('click', function() {
    const codigoDePostagem = document.getElementById('code').value;

    var promise = fetchCorreiosService(codigoDePostagem);

    promise.then((response) => {
      const keys = Object.keys(response);

      // keys.forEach((k, i) => alert(i + ' - ' + k + ' => ' + response[k]))
    });
  });
}

function fetchCorreiosService(codigoDePostagem) {
  const url = `${PROXY_URL}/https://apps.correios.com.br/SigepMasterJPA/AtendeClienteService/AtendeCliente`;
  const options = {
    method: 'POST',
    body: `<soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:cli=\"http://cliente.bean.master.sigep.bsb.correios.com.br/\">\n   <soapenv:Header/>\n   <soapenv:Body>\n      <cli:consultaSRO>\n         <listaObjetos>${codigoDePostagem}</listaObjetos>\n         <tipoConsulta>L</tipoConsulta>\n         <tipoResultado>T</tipoResultado>\n         <usuarioSro>ECT</usuarioSro>\n         <senhaSro>SRO</senhaSro>\n      </cli:consultaSRO>\n   </soapenv:Body>\n</soapenv:Envelope>`,
    headers: {
      'Content-Type': 'text/xml;charset=UTF-8',
      'cache-control': 'no-cache'
    }
  };

  return fetch(url, options)
    .then(analyzeAndParseResponse)
    .catch(throwApplicationError);
}

function analyzeAndParseResponse(response) {
  if (response.ok) {
    return response
      .text()
      .then(parseSuccessXML)
      .then(extractValuesFromSuccessResponse);
  }

  return response
    .text()
    .then(parseAndextractErrorMessage)
    .then(throwCorreiosError);
}

function parseSuccessXML(xmlString) {
  var parser = new DOMParser();
  parser.parseFromString(xmlString, 'text/xml');

  try {
    const returnStatement =
      xmlString.replace(/\r?\n|\r/g, '').match(/<return>(.*)<\/return>/)[0] ||
      '';

    const cleanReturnStatement = returnStatement
      .replace('<return>', '')
      .replace('</return>', '');

    alert(returnStatement);

    const parsedReturnStatement = cleanReturnStatement
      .split(/</)
      .reduce((result, exp) => {
        const splittenExp = exp.split('>');
        if (splittenExp.length > 1 && splittenExp[1].length) {
          result[splittenExp[0]] = splittenExp[1];
        }
        return result;
      }, {});

    return parsedReturnStatement;
  } catch (e) {
    throw new Error('Não foi possível interpretar o XML de resposta.');
  }
}

function extractValuesFromSuccessResponse(xmlObject) {
  // Especificar os campos de retorno.
  // return {
  //   versao: xmlObject.versao
  // };

  return xmlObject;
}

function parseAndextractErrorMessage(xmlString) {
  try {
    const returnStatement =
      xmlString.match(/<faultstring>(.*)<\/faultstring>/)[0] || '';
    const cleanReturnStatement = returnStatement
      .replace('<faultstring>', '')
      .replace('</faultstring>', '');
    return cleanReturnStatement;
  } catch (e) {
    throw new Error('Não foi possível interpretar o XML de resposta.');
  }
}

function throwCorreiosError(translatedErrorMessage) {
  throw new Error(translatedErrorMessage);
}

function throwApplicationError(error) {
  const serviceError = {
    message: error.message,
    service: 'correios'
  };

  if (error.name === 'FetchError') {
    serviceError.message = 'Erro ao se conectar com o serviço dos Correios.';
  }

  throw serviceError;
}

function xmlToJson(xml) {
  var obj = {};

  if (xml.nodeType == 1) {
    if (xml.attributes.length > 0) {
      obj['@attributes'] = {};
      for (var j = 0; j < xml.attributes.length; j++) {
        var attribute = xml.attributes.item(j);
        obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (xml.nodeType == 3) {
    obj = xml.nodeValue;
  }

  if (xml.hasChildNodes()) {
    for (var i = 0; i < xml.childNodes.length; i++) {
      var item = xml.childNodes.item(i);
      var nodeName = item.nodeName;
      if (typeof obj[nodeName] == 'undefined') {
        obj[nodeName] = xmlToJson(item);
      } else {
        if (typeof obj[nodeName].push == 'undefined') {
          var old = obj[nodeName];
          obj[nodeName] = [];
          obj[nodeName].push(old);
        }
        obj[nodeName].push(xmlToJson(item));
      }
    }
  }
  return obj;
}

document.addEventListener('DOMContentLoaded', load);
