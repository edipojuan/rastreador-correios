import './scss/main.scss';

import logo16 from './images/logo16.png';
import logo32 from './images/logo32.png';
import logo48 from './images/logo48.png';

'use strict';

const PROXY_URL = 'https://proxier.now.sh';

function load() {
  const btnSearch = document.getElementById('search');
  const btnClear = document.getElementById('clear');
  const inputCode = document.getElementById('code');
  const divTimeline = document.getElementById('timeline');

  if (chrome.storage) {
    chrome.storage.sync.get(['codes', 'test'], function (items) {
      const {
        codes
      } = items;

      if (codes) {
        inputCode.value = items.codes;
        btnSearch.click();
      }
    });
  }

  btnSearch.addEventListener('click', function () {
    const codigoDePostagem = inputCode.value;

    if (!codigoDePostagem) {
      notification('Informe o código de postagem.');
      return;
    }

    if (codigoDePostagem.length < 13) {
      notification('Código de postagem inválido.');
      return;
    }

    if (chrome.storage) {
      chrome.storage.sync.set({
        'codes': codigoDePostagem
      });
    }


    // const promise = fetchCorreiosService(codigoDePostagem);

    // promise.then((response) => {
    //   const {
    //     rastro
    //   } = response;

    //   const {
    //     objeto
    //   } = rastro;

    //   const {
    //     evento
    //   } = objeto;

    //   divTimeline.innerHTML = evento
    //     .map(
    //       (item) => {
    //         const dateArray = item.data.split('/');
    //         return `<article>
    //           <div class="inner">
    //             <span class="date">
    //               <span class="day">${dateArray[0]}<sup></sup></span>
    //               <span class="month">${getMonthName(+dateArray[1])}</span>
    //               <span class="year">${dateArray[2]}</span>
    //             </span>
    //             <h2>${item.descricao}</h2>
    //             <p>${item.local}, ${item.cidade}/${item.uf}</p>
    //           </div>
    //         </article>`
    //       }
    //     )
    //     .join('');
    // });

    const promise = fetchLinketrackService(codigoDePostagem);

    promise.then((response) => {
      const {
        eventos
      } = response;

      divTimeline.innerHTML = eventos
        .map(
          (item) => {
            const dateArray = item.data.split('/');
            return `<article>
              <div class="inner">
                <span class="date">
                  <span class="day">${dateArray[0]}<sup></sup></span>
                  <span class="month">${getMonthName(+dateArray[1])}</span>
                  <span class="year">${dateArray[2]}</span>
                </span>
                <h2>${item.status}</h2>
                <p>${item.local}, ${item.subStatus[0]}</p>
              </div>
            </article>`
          }
        )
        .join('');
    });
  });

  btnClear.addEventListener('click', function () {
    inputCode.value = '';
    divTimeline.innerHTML = '';
    notification('Rastreamento limpo com sucesso!');
  });
}

function notification(message) {
  const divNotification = document.getElementById('notifyType');

  divNotification.innerHTML = message;

  var element = document.querySelector(".notify");
  element.classList.add("active");
  var element1 = document.querySelector("#notifyType")
  element1.classList.add("success");

  setTimeout(() => {
    element.classList.remove("active");
  }, 2300);
}

function fetchLinketrackService(codigoDePostagem) {
  const url = `https://linketrack.com/track/json?user=edipojs&token=gCZ2EaiOIO0L0ozoQI0X7pO0o&codigo=${codigoDePostagem}`;
  const options = {};
  //   method: 'GET',
  //   headers: {
  //     'Content-Type': 'application/json; charset=utf-8'
  //   }
  // };

  return fetch(url, options)
    .then(analyzeAndParseResponse);
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
      .json()
      .then(resp => resp);
  }

  if (response.status === 500) {
    notification('Nenhum objeto encontrado.');
  }
}

// function analyzeAndParseResponse(response) {
//   if (response.ok) {
//     return response
//       .text()
//       .then(parseSuccessXML)
//       .then(extractValuesFromSuccessResponse)
//       .then(xmlToJson);
//   }

//   if (response.status === 500) {
//     notification('Nenhum objeto encontrado.');
//   }

//   // return response
//   //   .text()
//   //   .then(parseAndextractErrorMessage)
//   //   .then(throwCorreiosError);
// }

function parseSuccessXML(xmlString) {
  try {
    const returnStatement =
      xmlString
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\r?\n|\r/g, '')
      .match(/<return>(.*)<\/return>/)[0] || '';

    const cleanReturnStatement = returnStatement
      .replace('<return>', '')
      .replace('</return>', '');

    return cleanReturnStatement;
  } catch (e) {
    throw new Error('Não foi possível interpretar o XML de resposta.');
  }
}

function extractValuesFromSuccessResponse(xmlObject) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlObject, 'text/xml');

  return xml;
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
  let obj = {};

  if (xml.nodeType == 1) {
    if (xml.attributes.length > 0) {
      obj['@attributes'] = {};
      for (let j = 0; j < xml.attributes.length; j++) {
        let attribute = xml.attributes.item(j);
        obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (xml.nodeType == 3) {
    obj = xml.nodeValue;
  }

  if (xml.hasChildNodes()) {
    for (let i = 0; i < xml.childNodes.length; i++) {
      let item = xml.childNodes.item(i);
      let nodeName = item.nodeName;
      if (nodeName === '#text') {
        obj = item.nodeValue;
      } else if (typeof obj[nodeName] == 'undefined') {
        obj[nodeName] = xmlToJson(item);
      } else {
        if (typeof obj[nodeName].push == 'undefined') {
          let old = obj[nodeName];
          obj[nodeName] = [];
          obj[nodeName].push(old);
        }
        obj[nodeName].push(xmlToJson(item));
      }
    }
  }

  return obj;
}

function getMonthName(month) {
  switch (month) {
    case 1:
      return 'JAN';
    case 2:
      return 'FEV';
    case 3:
      return 'MAR';
    case 4:
      return 'ABR';
    case 5:
      return 'MAI';
    case 6:
      return 'JUN';
    case 7:
      return 'JUL';
    case 8:
      return 'AGO';
    case 9:
      return 'SET';
    case 10:
      return 'OUT';
    case 11:
      return 'NOV';
    case 12:
      return 'DEZ';
  }
}

document.addEventListener('DOMContentLoaded', load);
