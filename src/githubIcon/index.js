export default function(){
  document.getElementsByTagName("body")[0]
  .insertAdjacentHTML( 'beforeend', require('raw!./index.html'));
}
