'use strict';

const PROXY_URL = 'https://proxier.now.sh';

function load() {
  const btnSearch = document.getElementById('search');

  btnSearch.addEventListener('click', function () {
    const codigoDePostagem = document.getElementById("code").value

    var promise = fetchCorreiosService(codigoDePostagem);

    promise.then(response => {
      alert(Object.keys(response).forEach((k, i) => alert(i + ' - ' + k + ' => ' + response[k])))
    })
  });
}

function fetchCorreiosService(codigoDePostagem) {
  const url = `${PROXY_URL}/http://webservice.correios.com.br/service/rastro`;
  const options = {
    method: 'POST',
    body: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:res="http://resource.webservice.correios.com.br/"><soapenv:Header/><soapenv:Body><res:buscaEventosLista><usuario>ECT</usuario><senha>SRO</senha><tipo>L</tipo><resultado>T</resultado><lingua>101</lingua><objetos>${codigoDePostagem}</objetos></res:buscaEventosLista></soapenv:Body></soapenv:Envelope>`,
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
  try {
    const returnStatement =
      xmlString.replace(/\r?\n|\r/g, '').match(/<return>(.*)<\/return>/)[0] ||
      '';

    const cleanReturnStatement = returnStatement
      .replace('<return>', '')
      .replace('</return>', '');

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

document.addEventListener('DOMContentLoaded', load);
