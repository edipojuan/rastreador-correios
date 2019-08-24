function load() {
  const btnSearch = document.getElementById('search');

  btnSearch.addEventListener('click', function() {
    alert('Click btn Search');
  });
}

document.addEventListener('DOMContentLoaded', load);
