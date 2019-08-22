function load() {
  const btnSearch = document.getElementById('search');

  btnSearch.addEventListener('click', function () {
    alert('Click btn Search');

    fetch('http://webservice.correios.com.br:80/service/rastro', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          "Accept-Encoding": "UTF-8"
        },
        withCredentials: true,
        body: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"' +
          'xmlns:res="http://resource.webservice.correios.com.br/">' +
          '<soapenv:Header/>' +
          '<soapenv:Body>' +
          '<res:buscaEventosLista>' +
          '<usuario>ECT</usuario>' +
          '<senha>SRO</senha>' +
          '<tipo>L</tipo>' +
          '<resultado>T</resultado>' +
          '<lingua>101</lingua>' +
          '<objetos>JT124744261BR</objetos>' +
          '</res:buscaEventosLista>' +
          '</soapenv:Body>' +
          '</soapenv:Envelope>'
      })
      .then(response => {
        document.getElementById('result').innerHTML = response.statusText;
      }).catch(error => {
        document.getElementById('result').innerHTML = error;
      })
  });
}

document.addEventListener('DOMContentLoaded', load);