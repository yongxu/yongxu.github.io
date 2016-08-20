export function getDOMTextWidth(txt, fontname, fontsize){
  const e = document.createElement('span');
  e.style.fontSize = fontsize;
  e.style.fontFamily = fontname;
  e.innerHTML = txt;
  return e.innerWidth;
}
