'use strict';

export default function fetchCorreiosService(CodigoDePostagem, proxyURL = '') {
  const url = `${proxyURL}/http://webservice.correios.com.br:80/service/rastro`;
  const options = {
    method: 'POST',
    body: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:res="http://resource.webservice.correios.com.br/"><soapenv:Header/><soapenv:Body><res:buscaEventosLista><usuario>ECT</usuario><senha>SRO</senha><tipo>L</tipo><resultado>T</resultado><lingua>101</lingua><objetos>${CodigoDePostagem}</objetos></res:buscaEventosLista></soapenv:Body></soapenv:Envelope>`,
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
  debugger;
  return {
    versao: xmlObject.versao
  };
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
