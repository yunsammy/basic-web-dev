let maxZIndex = 2;

function dragElement(terrariumElement) {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;

  terrariumElement.onpointerdown = pointerDrag;
  terrariumElement.ondblclick = elementDbClick;
  function pointerDrag(e) {
    e.preventDefault();
    console.log(e);
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onpointermove = elementDrag;
    document.onpointerup = stopElementDrag;
  }

  function elementDrag(e) {
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    console.log(pos1, pos2, pos3, pos4);
    terrariumElement.style.top = terrariumElement.offsetTop - pos2 + "px";
    terrariumElement.style.left = terrariumElement.offsetLeft - pos1 + "px";
  }

  function stopElementDrag() {
    document.onpointerup = null;
    document.onpointermove = null;
  }

  function elementDbClick(e) {
    maxZIndex += 1;
    terrariumElement.style.zIndex = maxZIndex;
  }
}

const terrariumElements = [];
for (let i = 1; i < 15; i++) {
  let terrariumElement = document.getElementById(`plant${i}`);
  dragElement(terrariumElement);
}
