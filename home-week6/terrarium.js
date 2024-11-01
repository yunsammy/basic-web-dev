let maxZIndex = 2;

function dragElement(terrariumElement) {
  terrariumElement.draggable = true;

  // 요소 초기 top, left
  const rect = terrariumElement.getBoundingClientRect();
  const initialLeft = rect.left;
  const initialTop = rect.top;

  terrariumElement.addEventListener("dragstart", dragStartHandler);
  terrariumElement.addEventListener("dblclick", elementDbClick);

  function dragStartHandler(e) {
    // 요소 위의 마우스 위치 offset (요소 top, left 기준)
    const rect = terrariumElement.getBoundingClientRect();
    const offsetX = rect.left - e.clientX;
    const offsetY = rect.top - e.clientY;

    // dataTransfer 객체에 drop시 요소 위치 결정에 필요한 데이터 json으로 저장
    // https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/types
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        id: terrariumElement.id,
        initialLeft: initialLeft,
        initialTop: initialTop,
        offsetX: offsetX,
        offsetY: offsetY,
      })
    );
  }

  function elementDbClick() {
    maxZIndex += 1;
    terrariumElement.style.zIndex = maxZIndex;
  }
}

// dropElement위에서만 요소 drop할 수 있게 함
function dropElement(dropElement) {
  dropElement.addEventListener("dragover", dragoverHandler);
  dropElement.addEventListener("drop", dropHandler);

  function dragoverHandler(e) {
    e.preventDefault();
  }

  function dropHandler(e) {
    e.preventDefault();

    const data = e.dataTransfer.getData("application/json");
    const { id, initialLeft, initialTop, offsetX, offsetY } = JSON.parse(data);

    const terrariumElement = document.getElementById(id);

    terrariumElement.style.left = e.clientX - initialLeft + offsetX + "px";
    terrariumElement.style.top = e.clientY - initialTop + offsetY + "px";

    // terrarium 요소 겹쳐서 drop 할 수 있게 설정
    terrariumElement.addEventListener("dragover", dragoverHandler);
    terrariumElement.addEventListener("drop", dropHandler);
  }
}

for (let i = 1; i < 15; i++) {
  dragElement(document.getElementById(`plant${i}`));
}
dropElement(document.getElementById("jar-walls"));
