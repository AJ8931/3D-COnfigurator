import React, { useEffect, memo } from "react";
import * as THREE from "three";
import { fabric } from "fabric";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const ThreeScene = memo(() => {
  useEffect(() => {
    // FABRIC CANVAS-------------
    const canvasFabricSize = 2000;
    var canvasFabric = new fabric.Canvas("canvasFabric", {
      height: canvasFabricSize,
      width: canvasFabricSize,
    });

    // RENDERER CANVAS-----------
    const canvas = document.getElementById("canvasRenderer");
    const scene = new THREE.Scene();
    const BACKGROUND_COLOR = 0xf1f1f1;
    // Set background
    scene.background = new THREE.Color(BACKGROUND_COLOR);
    scene.fog = new THREE.Fog(BACKGROUND_COLOR, 30, 700);

    // Add lights
    var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
    hemiLight.position.set(0, 50, 0);
    // Add hemisphere light to scene
    scene.add(hemiLight);

    var dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
    dirLight.position.set(-8, 12, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
    // Add directional Light to scene
    scene.add(dirLight);

    // Floor
    var floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
    var floorMaterial = new THREE.MeshPhongMaterial({
      color: 0xbebebe,
      shininess: 0,
    });

    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -0.5 * Math.PI;
    floor.receiveShadow = true;
    floor.position.y = -61;
    scene.add(floor);

    // ADDING SHIRT-----------
    // const shirtUrl = new URL("../MODELS/tshirt2222.glb", import.meta.url);
    const shirtLoader = new GLTFLoader();
    shirtLoader.load("/Models/tshirt2222.glb", (obj) => {
      const shirt = obj.scene;
      scene.add(shirt);
      // shirt.position.z =0;
      shirt.position.set(0, -60, 20);
      shirt.scale.set(2, 2, 2);
      // shirt.position.z=3;

      //APPLYING TEXTURE TO THE SHIRT-----------
      const applyingTexture = () => {
        //TAKING THE SVG FROM HTML-----------
        var svgFromDoc = document.getElementById("Capa_2");
        // console.log(svgFromDoc);
        var svgInString = new XMLSerializer().serializeToString(svgFromDoc);
        // console.log(svgInString);
        // ADDING SVG TO THE FABRIC CANVAS-----------
        fabric.loadSVGFromString(svgInString, (obj, opt) => {
          const svgInFabric = fabric.util.groupSVGElements(obj, opt);

          // ADDING AS A BACKGROUND IMAGE-----------
          canvasFabric.setBackgroundImage(
            svgInFabric,
            canvasFabric.renderAll.bind(canvasFabric)
          );
        });

        //WRAPING OF FABRIC CANVAS ON THE SHIRT-----------
        shirt.getObjectByName("front").material.map = new THREE.CanvasTexture(
          document.getElementById("canvasFabric")
        );
      };

      applyingTexture();

      var inc; // INC FOR RESIZING IMAGE-----------

      document.getElementById("uplImg").addEventListener("click", () => {
        //UPLOADING THE IMAGE-----------
        const theImgFromFile = document.getElementById("theFile").files[0];
        const reader = new FileReader();
        if (!theImgFromFile) return alert("Please select an image");
        reader.readAsDataURL(theImgFromFile);
        reader.onload = () => {
          //ADDING THE IMAGE IN THE FABRIC CANVAS-----------
          fabric.Image.fromURL(reader.result, (uploadedImg) => {
            uploadedImg.scale(0.2);
            uploadedImg.left = 400;
            uploadedImg.top = 200;
            uploadedImg.id = canvasFabric._objects.length;

            canvasFabric.add(uploadedImg).renderAll();

            applyingTexture();

            var raycastingCanva = new THREE.Raycaster();
            var mouseClicking = new THREE.Vector2();
            var mouseMoving = new THREE.Vector2();
            var dragObj;
            var showCorner = false;
            var onResize = false;
            var dragToResize = false;
            var onDelete = false;
            var objId;

            window.addEventListener("mousedown", (e) => {
              mouseClicking.x =
                2 *
                  ((e.clientX - canvas.getBoundingClientRect().left) /
                    (window.innerWidth / 2)) -
                1;
              mouseClicking.y =
                1 -
                2 *
                  ((e.clientY - canvas.getBoundingClientRect().top) /
                    (window.innerHeight / 1.4));
              raycastingCanva.setFromCamera(mouseClicking, camera);

              var intersected = raycastingCanva.intersectObjects(
                scene.children
              );

              if (
                intersected[0] &&
                intersected[0].object.userData.name == "front"
              ) {
                //intersecte[0] - to not show that annoying error
                var uvToTransform = intersected[0].uv;
                intersected[0].object.material.map.transformUv(uvToTransform);

                if (canvasFabric._objects.length > 0) {
                  // IF THERE IS ANY OBJECT IN THE CANVAS

                  canvasFabric._objects.forEach((element) => {
                    const widthing =
                      uvToTransform.x * 2000 - 4.5 > element.left + 40 &&
                      uvToTransform.x * 2000 - 4.5 <
                        element.getBoundingRect().width - 40 + element.left;
                    const heighting =
                      uvToTransform.y * 2000 - 5.5 > element.top + 40 &&
                      uvToTransform.y * 2000 - 5.5 <
                        element.getBoundingRect().height - 40 + element.top;

                    applyingTexture();

                    if (widthing && heighting) {
                      controling.enabled = false;
                      dragObj = true;
                      objId = element.id;
                      console.log("picked");
                    }
                  });
                  // console.log(uploadedImg);
                }
              }

              // IF MOUSE CURSOR IS CHANGED THEN-----------
              if (onResize) {
                controling.enabled = false;
                dragToResize = true;
              }

              //CAN BE IN CLICK OR MOUSE DOWN EVENT LISTENER-----------
              if (onDelete == true) {
                canvasFabric.getActiveObjects().forEach((obj) => {
                  canvasFabric.remove(obj).renderAll();
                  document.body.style.cursor = "default";
                  // console.log(canvasFabric._objects.length);
                });
                applyingTexture();
              }
            }); //CLICK EVENT CLOSED

            canvas.addEventListener("click", (e) => {
              if (canvasFabric._objects.length > 0) {
                //ACTIVE OR INACTIVE OBJECTS ON SIMPLE CLICK-----------
                if (showCorner == false) {
                  canvasFabric
                    .setActiveObject(canvasFabric.item(objId))
                    .renderAll();
                  showCorner = true;
                  canvasFabric.item(objId).transparentCorners = false;
                  canvasFabric.item(objId).cornerSize = 50;
                  canvasFabric.item(objId).setControlsVisibility({
                    bl: false,
                    br: true,
                    mb: false,
                    ml: false,
                    mr: false,
                    mt: false,
                    tl: true,
                    tr: false,
                    mtr: false,
                  });
                  canvasFabric.item(objId).cornerColor = "darkblue";
                  canvasFabric.item(objId).cornerStyle = "circle";
                  applyingTexture();
                  return false;
                }
                if (showCorner == true) {
                  canvasFabric
                    .discardActiveObject(canvasFabric.item(objId))
                    .renderAll();
                  showCorner = false;
                  applyingTexture();
                }
              }
            }); //MOUSE CLICK EVENT CLOSED

            window.addEventListener("mouseup", () => {
              controling.enabled = true;
              if (dragObj == true) {
                dragObj = false;
                // console.log('droped');
                return false;
              }

              if (dragToResize == true) {
                dragToResize = false;
              }
            }); //MOUSE UP EVENT CLOSED

            window.addEventListener("mousemove", (e) => {
              mouseMoving.x =
                2 *
                  ((e.clientX - canvas.getBoundingClientRect().left) /
                    (window.innerWidth / 2)) -
                1;
              mouseMoving.y =
                1 -
                2 *
                  ((e.clientY - canvas.getBoundingClientRect().top) /
                    (window.innerHeight / 1.4));

              raycastingCanva.setFromCamera(mouseMoving, camera);
              var intersected = raycastingCanva.intersectObjects(
                scene.children
              );

              //FOR IMAGE TO MOVE-----------
              if (
                intersected[0] &&
                dragObj &&
                intersected[0].object.userData.name == "front"
              ) {
                //intersecte[0] - to not display that annoying error
                // console.log('shouldMove');
                var uvToTransform = intersected[0].uv;
                intersected[0].object.material.map.transformUv(uvToTransform);

                if (canvasFabric._objects.length > 0) {
                  canvasFabric.item(objId).left =
                    uvToTransform.x * 2000 -
                    4.5 -
                    canvasFabric.item(objId).getBoundingRect().width * 0.5;
                  canvasFabric.item(objId).top =
                    uvToTransform.y * 2000 -
                    5.5 -
                    canvasFabric.item(objId).getBoundingRect().height * 0.5;
                }

                applyingTexture();
              } //IMG MOVING CLOSED

              // FOR RESIZE AND DELETE CURSOR CHANGE-----------
              if (canvasFabric._objects.length > 0) {
                if (canvasFabric.getActiveObject(canvasFabric.item(objId))) {
                  if (
                    intersected[0] &&
                    intersected[0].object.userData.name == "front"
                  ) {
                    var uvToTransform = intersected[0].uv;
                    intersected[0].object.material.map.transformUv(
                      uvToTransform
                    );
                    // console.log(canvasFabric.item(objId).oCoords.br.x,uvToTransform.x*2000-4.5);
                    //FOR CURSOR STYLE TO CHANGE TO RESIZE-----------
                    const mouseResizingX =
                      Math.round(
                        (canvasFabric.item(objId).oCoords.br.touchCorner.br.x -
                          20) /
                          50
                      ) *
                        50 ==
                      Math.round((uvToTransform.x * 2000 - 4.5) / 50) * 50;
                    const mouseResizingY =
                      Math.round(
                        canvasFabric.item(objId).oCoords.br.touchCorner.br.y /
                          50
                      ) *
                        50 ==
                      Math.round((uvToTransform.y * 2000 - 5.5) / 50) * 50;

                    // FOR CURSOR STYLE TO CHANGE TO DELETE-----------
                    const mouseDeletingX =
                      Math.round(
                        (canvasFabric.item(objId).oCoords.tl.touchCorner.tl.x +
                          20) /
                          50
                      ) *
                        50 ==
                      Math.round((uvToTransform.x * 2000 - 4.5) / 50) * 50;
                    const mouseDeletingY =
                      Math.round(
                        (canvasFabric.item(objId).oCoords.tl.touchCorner.tl.y +
                          20) /
                          50
                      ) *
                        50 ==
                      Math.round((uvToTransform.y * 2000 - 5.5) / 50) * 50;

                    if (mouseResizingX && mouseResizingY) {
                      console.log(1);
                      onResize = true;
                      document.body.style.cursor = "nw-resize";
                      console.log("mouseResize");
                    } else if (mouseDeletingX && mouseDeletingY) {
                      onDelete = true;
                      document.body.style.cursor = "not-allowed";
                      console.log("mouseDelete");
                    } else {
                      onDelete = false;
                      onResize = false;
                      document.body.style.cursor = "default";
                      console.log("bothNot");
                    }
                    applyingTexture();
                  } //IF INTERSECTED[0] IN RENDERER CANVAS
                } // IF ACTIVE OBJ IN FABRIC CANVAS
              } //IF OBJ IN FABRIC CANVAS

              if (canvasFabric._objects.length > 0) {
                // IF MOUSE DOWN IS TRUE THEN-----------
                if (dragToResize) {
                  if (e.clientY > inc)
                    canvasFabric
                      .item(objId)
                      .scale(canvasFabric.item(objId).scaleX + 0.005);

                  if (e.clientY < inc)
                    canvasFabric
                      .item(objId)
                      .scale(canvasFabric.item(objId).scaleX - 0.005);

                  inc = e.clientY;

                  canvasFabric.renderAll();
                  applyingTexture();
                }
              }
            }); //MOVED EVENT CLOSED
          }); //FOOTBALL IMAGE CLOSED
        }; //READER CLOSED
      }); //IMAGE UPLOAD CLOSED

      document.getElementById("svgB3").addEventListener("input", (e) => {
        document.getElementById("Body").setAttribute("fill", e.target.value);
        applyingTexture();
      });

      document.getElementById("sideStripes").addEventListener("input", (e) => {
        //front Stripes triangle
        document.getElementById("Two").setAttribute("fill", e.target.value);
        //back stripes triangle
        document.getElementById("Two1").setAttribute("fill", e.target.value);
        applyingTexture();
      });

      document
        .getElementById("fontRightStripes")
        .addEventListener("input", (e) => {
          //front right band
          document.getElementById("Two2").setAttribute("fill", e.target.value);
          //front left band
          document.getElementById("Two3").setAttribute("fill", e.target.value);
          //back right band
          document.getElementById("Two4").setAttribute("fill", e.target.value);
          //back left band
          document.getElementById("Two5").setAttribute("fill", e.target.value);
          applyingTexture();
        });

      document
        .getElementById("designPattern")
        .addEventListener("input", (e) => {
          //front design
          document.getElementById("Two6").setAttribute("fill", e.target.value);
          //back design
          document.getElementById("Two7").setAttribute("fill", e.target.value);
          applyingTexture();
        });

      document
        .getElementById("collarNSleeveHem")
        .addEventListener("input", (e) => {
          //collar and sleeves hem
          document.getElementById("Two8").setAttribute("fill", e.target.value);
          applyingTexture();
        });

      document
        .getElementById("textFontColor")
        .addEventListener("input", (e) => {
          //Font
          document.getElementById("Font").setAttribute("fill", e.target.value);
          applyingTexture();
        });

      document.getElementById("logoColor").addEventListener("input", (e) => {
        //Front Logo
        document
          .getElementById("Wooter_Logo")
          .setAttribute("fill", e.target.value);
        applyingTexture();
      });

      document.getElementById("topDesign").addEventListener("input", (e) => {
        //Shoulder Design
        document.getElementById("Two10").setAttribute("fill", e.target.value);
        document.getElementById("Two11").setAttribute("fill", e.target.value);
        document.getElementById("Two12").setAttribute("fill", e.target.value);
        document.getElementById("Two13").setAttribute("fill", e.target.value);
        //shoulder Thin Stripes
        document.getElementById("Two15").setAttribute("fill", e.target.value);
        document.getElementById("Two16").setAttribute("fill", e.target.value);
        document.getElementById("Two17").setAttribute("fill", e.target.value);
        applyingTexture();
      });

      document.getElementById("svgText").addEventListener("input", (e) => {
        document.getElementById("Font").textContent = e.target.value;
        applyingTexture();
      });
    }); //OBJECT MODAL TILL HERE

    const camera = new THREE.PerspectiveCamera(
      80,
      window.innerWidth / 2 / (window.innerHeight / 1.4),
      1,
      1000
    );
    scene.add(camera);
    // camera.position.set(0,35,30) //with no Orbit Control
    // camera.rotateX(-0.6)
    camera.position.set(0, 40, 100); //with orbit Control

    // camera.aspect = window.innerWidth/2/1.5 / window.innerHeight/2/1.5.5;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas });
    // renderer.setPixelRatio();
    renderer.setSize(window.innerWidth / 2, window.innerHeight / 1.4);
    // renderer.render(scene,camera)

    const controling = new OrbitControls(camera, renderer.domElement);
    controling.update();
    controling.maxPolarAngle = 1.5;

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / 2 / (window.innerHeight / 1.5);
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth / 2, window.innerHeight / 1.4);
    });

    const anim = () => {
      requestAnimationFrame(anim);
      renderer.render(scene, camera);
    };
    anim();
  }, []);

  return (
    <>
      <h1>T-SHIRT Configurator</h1>
      <div className="card">
        <div className="obj01 item">
          <canvas id="canvasRenderer" />
        </div>
        <div className="obj02 item">
          <label>
            {" "}
            Side-stripes
            <input type="color" id="sideStripes" />
          </label>

          <label>
            {" "}
            Design-Pattern
            <input type="color" id="designPattern" />
          </label>

          <label>
            {" "}
            Collar Sleeve-Hem
            <input type="color" id="collarNSleeveHem" />
          </label>

          <label>
            {" "}
            Front Right Stripes
            <input type="color" id="fontRightStripes" />
          </label>

          <label>
            {" "}
            Text-Font Color
            <input type="color" id="textFontColor" />
          </label>

          <label>
            {" "}
            logo color
            <input type="color" id="logoColor" />
          </label>

          <label>
            {" "}
            Top Design
            <input type="color" id="topDesign" />
          </label>

          <label>
            {" "}
            Body
            <input id="svgB3" type="color" />
          </label>

          <label>
            Enter Player No. here
            <input type="text" id="svgText" />
          </label>

          <input type="file" id="theFile" />
          <input type="button" id="uplImg" value="upload" />
        </div>
      </div>

      <canvas id="canvasFabric" />

      <br />
      <br />
      <br />
      <br />
      <br />
      <svg
        version="1.1"
        id="Capa_2"
        width="2000"
        height="2000"
        textRendering="geometricPrecision"
        shapeRendering="geometricPrecision"
        imageRendering="optimizeQuality"
        x="0px"
        y="0px"
        viewBox="0 0 2000 2000"
        enableBackground="new 0 0 2000 2000"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          id="Body"
          fill="#FF0000"
          d="M97.4,356.2l5.1,42.9c0,0-43.6,67.8-92.6,70.4L80.6,1749l907.1-1.1l-9-1276.2
	c0,0-58.9-30.4-103.3-56.3c0,0,26.8-114.6,46.3-200.4c0,0,27.8-59.5,42.8-111.9L609.1,14.3c0,0-6.4,39.2-29.6,112.2
	c-8,9-14.1,15.9-19.3,21.6c-37.7,41.4-104.4,38.1-137-7.5c-0.5-0.8-1.1-1.5-1.6-2.3c0,0-26.9-29.7-45-111.9L21.5,110.9
	 M1145.9,380.9c0,0-20.1,112.7-66.2,111.9l19.3,1268.4l286.4-34.7c10.5-1.3,21-1.4,31.5-0.5l511.4,44.3l50.1-1261.9
	c0,0-78.6-61.8-63.6-146.6l46.9-217.3l-282.2-92.6c0,0-70.3,26.9-150.4,45c0,0-29.6,6.6-44.6,5.8c-42.5-2.4-30.6,1.9-60.2-12.9
	c-8.4-4.2-27.6-41.8-27.6-41.8l-296.4,96L1145.9,380.9z"
        />

        <g>
          <path
            id="Two10"
            fillRule="evenodd"
            clipRule="evenodd"
            fill="#EF4E4B"
            d="M921.2,292.7c0.8-11.7,2-23.8,3.5-36.2L803,62.5l-32.5-10.1
		L921.2,292.7L921.2,292.7z"
          />
          <path
            id="Two11"
            fillRule="evenodd"
            clipRule="evenodd"
            fill="#EF4E4B"
            d="M346.9,33.8l-274,48.5c3,11.6-2.6,7.5,0,19l338.4,37l-33.9-112
		L346.9,33.8z"
          />
          <path
            id="Two12"
            fillRule="evenodd"
            clipRule="evenodd"
            fill="#EF4E4B"
            d="M824.1,69.1l103.5,165c0.8-5.5,1.6-11,2.6-16.6L840.2,74l0,0
		L824.1,69.1L824.1,69.1z"
          />
          <path
            id="Two13"
            fillRule="evenodd"
            clipRule="evenodd"
            fill="#EF4E4B"
            d="M933.7,197.2c5.1-27.8,11.5-57.2,19.4-88.2l-92.7-28.7
		L933.7,197.2z"
          />
        </g>
        <path
          id="Wooter_Logo"
          fill="#FFFF00"
          d="M502.5,329.1c-6.7,6.8-7.6,18.5-1.8,26.1c4.8,6.7,13.9,9.6,21.8,7.6
	c3.8-1.1,7.1-3.4,9.9-6.1h0c3.2,3.1,7.1,5.7,11.5,6.5c6.7,1.4,14-0.7,18.7-5.7c6.7-6.8,7.6-18.5,1.8-26.1
	c-4.8-6.7-13.9-9.6-21.8-7.6c-3.8,1.1-7.1,3.4-9.9,6.1l0,0c-3.2-3.1-7.1-5.7-11.5-6.5C514.5,322,507.2,324.1,502.5,329.1
	L502.5,329.1z M538.2,335.3c2.5-2.6,5.8-4.6,9.5-4.6c7.6-0.4,14.2,7.3,12.8,14.7c-1,7.1-8.9,12.4-15.8,10.3c-4.7-1.5-7.7-5.8-11.2-9
	c-2.5-2.3-4.5-5.1-7.4-6.9c-2.9-1.4-6.2,2-4.8,4.9c0.7,1.3,3.2,4,5.7,6.5c-2.5,2.6-5.8,4.6-9.5,4.6c-7.6,0.4-14.2-7.3-12.8-14.7
	c1.1-7.1,8.9-12.4,15.8-10.3c4.7,1.5,7.7,5.8,11.2,9c2.5,2.3,4.5,5.2,7.4,6.9c2.9,1.4,6.2-2.1,4.9-4.9
	C543.1,340.5,540.6,337.8,538.2,335.3L538.2,335.3L538.2,335.3z"
        />
        <text
          id="Font"
          textAnchor="middle"
          x="2%"
          transform="matrix(1 0 0 1 1505.8291 343.3087)"
          fill="#FFFFFF"
          fontFamily="'ArialMT'"
          fontSize="88.3117px"
        >
          31
        </text>
        <path
          id="Two14"
          fillRule="evenodd"
          clipRule="evenodd"
          fill="#4B4B4D"
          d="M1072,1271.7l-28.4,28.5l-15.8-4.5c-3.1-1.4-6.1-2.8-9.1-4.2
	l2.3-17.8L1072,1271.7L1072,1271.7z"
        />
        <g>
          <g>
            <path
              id="Two15"
              fillRule="evenodd"
              clipRule="evenodd"
              fill="#4B4B4D"
              d="M927.4,248.8c0.7-11.6,1.6-23.5,2.8-35.7
			c-0.4,4.5-0.8,8.9-1.2,13.2L827.5,66l-19.4-5.6L927.4,248.8L927.4,248.8z"
            />
            <path
              id="Two16"
              fillRule="evenodd"
              clipRule="evenodd"
              fill="#4B4B4D"
              d="M850.9,72.4l88.3,139.5l-0.3,3.4c0.8-7.8,1.6-15.8,2.6-23.9
			L869.6,77.8L850.9,72.4L850.9,72.4z"
            />
            <path
              id="Two17"
              fillRule="evenodd"
              clipRule="evenodd"
              fill="#4B4B4D"
              d="M921.2,293.4c0-2.2,0-4.4,0.1-6.7L773.5,53.2l-4.9-1.4
			L921.2,293.4L921.2,293.4z"
            />
          </g>
          <polygon
            id="Two8"
            fill="#4B4B4D"
            points="70.8,1764.7 70.8,1983.7 1867.8,1983.7 1867.8,1775.9 1655.3,1752 1469.2,1734.7 1363.4,1735.6 
		1081.2,1769 	"
          />
          <polygon
            id="Two7"
            fillRule="evenodd"
            clipRule="evenodd"
            fill="#4B4B4D"
            points="1959.1,777.5 1919.3,1340 1131.5,1340 2000,479.9 	"
          />
          <path
            id="Two6"
            fillRule="evenodd"
            clipRule="evenodd"
            fill="#4B4B4D"
            d="M1010.2,444.8l-83.3,364.1L944,1340l-851.3-5.2
		C92.7,1334.8,1003.6,443.3,1010.2,444.8z"
          />
          <polygon
            id="Two"
            fillRule="evenodd"
            clipRule="evenodd"
            fill="#4B4B4D"
            points="1017,418.6 96.6,1311.6 78,1305.6 25.1,1288.5 
		78.3,1288.2 113.2,1288 100.4,1283.9 47.5,1266.8 100.7,1266.5 135.6,1266.3 122.8,1262.2 69.9,1245 123.1,1244.8 158.1,1244.6 
		145.2,1240.4 92.3,1223.3 145.5,1223 180.5,1222.8 167.6,1218.7 114.7,1201.5 167.9,1201.3 202.8,1201.1 190,1196.9 137.1,1179.8 
		190.3,1179.5 225.3,1179.4 212.4,1175.2 159.5,1158.1 212.7,1157.8 247.7,1157.6 234.9,1153.5 181.9,1136.4 235.1,1136.1 
		270.1,1135.9 257.3,1131.8 204.3,1114.6 257.5,1114.3 292.5,1114.2 279.7,1110 226.8,1092.9 279.9,1092.6 314.9,1092.4 
		302.1,1088.3 249.2,1071.2 302.3,1070.9 337.3,1070.7 324.5,1066.5 271.6,1049.4 324.7,1049.1 359.7,1049 346.9,1044.8 294,1027.7 
		347.1,1027.4 382.1,1027.2 369.3,1023.1 316.4,1005.9 369.5,1005.7 404.5,1005.5 391.7,1001.3 338.8,984.2 391.9,983.9 
		426.9,983.8 414.1,979.6 361.2,962.5 414.3,962.2 449.3,962 436.5,957.9 383.6,940.7 436.7,940.5 471.7,940.3 458.9,936.1 406,919 
		459.1,918.7 494.1,918.6 481.3,914.4 428.4,897.3 481.5,897 516.5,896.8 503.7,892.7 450.8,875.5 504,875.3 538.9,875.1 
		526.1,870.9 473.2,853.8 526.4,853.5 561.3,853.3 548.5,849.2 495.6,832.1 548.8,831.8 583.7,831.6 570.9,827.5 518,810.3 
		571.2,810.1 606.1,809.9 593.3,805.7 540.4,788.6 593.6,788.3 628.6,788.1 615.7,784 562.8,766.9 616,766.6 650.9,766.4 
		638.1,762.3 585.2,745.1 638.4,744.9 673.3,744.7 660.5,740.5 607.6,723.4 660.8,723.1 695.7,722.9 682.9,718.8 630,701.7 
		683.2,701.4 718.1,701.2 705.3,697.1 652.4,679.9 705.6,679.7 740.5,679.5 727.7,675.3 674.8,658.2 728,657.9 762.9,657.7 
		750.1,653.6 697.2,636.5 750.4,636.2 785.4,636 772.5,631.8 719.6,614.7 772.8,614.4 807.8,614.3 794.9,610.1 742,593 795.2,592.7 
		830.1,592.5 817.3,588.4 764.4,571.2 817.6,571 852.5,570.8 839.7,566.7 786.8,549.5 840,549.2 875,549.1 862.1,544.9 809.2,527.8 
		862.4,527.5 897.4,527.3 884.5,523.2 831.6,506.1 884.8,505.8 919.8,505.6 907,501.5 854,484.3 907.2,484 942.2,483.9 929.4,479.7 
		876.4,462.6 929.6,462.3 964.6,462.1 951.8,458 898.8,440.8 952,440.6 987,440.4 974.2,436.2 921.2,419.1 974.4,418.8 	"
          />
          <polygon
            id="Two1"
            fillRule="evenodd"
            clipRule="evenodd"
            fill="#4B4B4D"
            points="1992.8,468.4 1081.9,1371.1 1063.3,1365.3 1010.2,1348.7 
		1063.4,1347.8 1098.3,1347.3 1085.5,1343.3 1032.4,1326.7 1085.5,1325.9 1120.5,1325.3 1107.6,1321.3 1054.6,1304.7 1107.7,1303.9 
		1142.7,1303.4 1129.8,1299.3 1076.7,1282.8 1129.9,1281.9 1164.9,1281.4 1152,1277.4 1098.9,1260.8 1152.1,1260 1187,1259.4 
		1174.2,1255.4 1121.1,1238.8 1174.2,1238 1209.2,1237.4 1196.3,1233.4 1143.2,1216.9 1196.4,1216 1231.4,1215.5 1218.5,1211.5 
		1165.4,1194.9 1218.6,1194.1 1253.5,1193.5 1240.7,1189.5 1187.6,1172.9 1240.8,1172.1 1275.7,1171.5 1262.8,1167.5 1209.8,1151 
		1262.9,1150.1 1297.9,1149.6 1285,1145.5 1231.9,1129 1285.1,1128.1 1320.1,1127.6 1307.2,1123.6 1254.1,1107 1307.3,1106.2 
		1342.2,1105.6 1329.4,1101.6 1276.3,1085 1329.4,1084.2 1364.4,1083.6 1351.5,1079.6 1298.4,1063.1 1351.6,1062.2 1386.6,1061.7 
		1373.7,1057.7 1320.6,1041.1 1373.8,1040.3 1408.7,1039.7 1395.9,1035.7 1342.8,1019.1 1396,1018.3 1430.9,1017.7 1418,1013.7 
		1365,997.2 1418.1,996.3 1453.1,995.8 1440.2,991.8 1387.1,975.2 1440.3,974.3 1475.3,973.8 1462.4,969.8 1409.3,953.2 
		1462.5,952.4 1497.4,951.8 1484.6,947.8 1431.5,931.2 1484.6,930.4 1519.6,929.9 1506.7,925.8 1453.6,909.3 1506.8,908.4 
		1541.8,907.9 1528.9,903.9 1475.8,887.3 1529,886.5 1563.9,885.9 1551.1,881.9 1498,865.3 1551.2,864.5 1586.1,863.9 1573.2,859.9 
		1520.2,843.4 1573.3,842.5 1608.3,842 1595.4,838 1542.3,821.4 1595.5,820.6 1630.5,820 1617.6,816 1564.5,799.4 1617.7,798.6 
		1652.6,798 1639.8,794 1586.7,777.4 1639.8,776.6 1674.8,776.1 1661.9,772.1 1608.8,755.5 1662,754.6 1697,754.1 1684.1,750.1 
		1631,733.5 1684.2,732.7 1719.1,732.1 1706.3,728.1 1653.2,711.5 1706.4,710.7 1741.3,710.2 1728.5,706.1 1675.4,689.6 
		1728.5,688.7 1763.5,688.2 1750.6,684.2 1697.5,667.6 1750.7,666.8 1785.7,666.2 1772.8,662.2 1719.7,645.6 1772.9,644.8 
		1807.8,644.2 1795,640.2 1741.9,623.7 1795,622.8 1830,622.3 1817.1,618.3 1764,601.7 1817.2,600.8 1852.2,600.3 1839.3,596.3 
		1786.2,579.7 1839.4,578.9 1874.3,578.3 1861.5,574.3 1808.4,557.7 1861.6,556.9 1896.5,556.4 1883.7,552.4 1830.6,535.8 
		1883.7,534.9 1918.7,534.4 1905.8,530.4 1852.7,513.8 1905.9,513 1940.9,512.4 1928,508.4 1874.9,491.8 1928.1,491 1963,490.4 
		1950.2,486.4 1897.1,469.9 1950.2,469 	"
          />
        </g>

        <g>
          <path
            id="Two2"
            fillRule="evenodd"
            clipRule="evenodd"
            fill="#323233"
            d="M170.3,1313l-146.6-35.1V435.8l74.2-6.9l20.3,74.7
		c5.1,18.9,9.3,38.1,12.4,57.4l9.1,56.1L156.5,765l11.9,193.2l6.1,197c0.4,13.8,0.4,27.6-0.1,41.4L170.3,1313z"
          />
          <path
            id="Two3"
            fillRule="evenodd"
            clipRule="evenodd"
            fill="#323233"
            d="M1069.4,1345l-201.3-14.4l8.2-168.8l5.7-65.7
		c3-35,4-70.2,2.8-105.4l-1.8-57.2c-0.6-18.5-0.5-36.9,0.1-55.4l0.3-7.4c0.7-19.3,2.1-38.5,4.2-57.6l9.1-85l9.6-99
		c2.5-25.7,6.3-51.3,11.3-76.6l4.6-23.2l26.4-114.9l120.7,16.4V1345z"
          />
          <path
            id="Two4"
            fillRule="evenodd"
            clipRule="evenodd"
            fill="#323233"
            d="M2008.9,1371.1h-132.8v-33.6v-75.2v-67.5l4.5-88.7l3.2-91.9v-54.4
		c0-20.3,0.6-40.5,1.7-60.8l3.5-62.8l12.2-113.8l3.8-33.4c3.9-34.3,9.4-68.4,16.5-102.1l10.9-51.7l19-94.9l57.5-7V1371.1z"
          />
          <path
            id="Two5"
            fillRule="evenodd"
            clipRule="evenodd"
            fill="#323233"
            d="M1187.1,1355.5h-148V464.3l66.3-8.1l24.2,61.1
		c1.2,3,2.3,6.1,3.2,9.2v0c7.5,24.5,12.2,49.8,14.3,75.4l4.7,59.7l12.9,121.3l13.3,105.4c0.8,6.6,1.3,13.3,1.5,19.9l3.2,161.9
		l4.4,121.3v102V1355.5z"
          />
        </g>
        <g id="Acc_Locker_Tag">
          <g id="Locker_Tag">
            <polygon
              fillRule="evenodd"
              clipRule="evenodd"
              fill="#FFFFFF"
              points="204.6,1140.6 366,1140.6 366,1076 204.6,1076 		"
            />
            <polygon
              fillRule="evenodd"
              clipRule="evenodd"
              points="204.6,1140.6 366,1140.6 366,1121.8 204.6,1121.8 		"
            />
            <polygon
              fillRule="evenodd"
              clipRule="evenodd"
              points="204.6,1121 282.4,1121 282.4,1076 204.6,1076 		"
            />
            <path
              fill="#FFFFFF"
              d="M259.5,1083.8h-2.1l-3.3,7.9h2.3l0.6-1.4h3l0.6,1.4h2.3L259.5,1083.8z M257.6,1088.5l0.9-2.2l0.9,2.2
			H257.6z M253.3,1091.6v-7.8h-3c-2.8,0-4.4,1.6-4.4,3.8v0c0,2.3,1.6,3.9,4.4,3.9L253.3,1091.6L253.3,1091.6z M250.3,1089.7
			c-1.3,0-2.2-0.7-2.2-2v0c0-1.3,0.9-2,2.2-2h0.9v4H250.3z M244.9,1088.2v-4.4h-2.2v4.3c0,1.1-0.6,1.7-1.4,1.7
			c-0.9,0-1.4-0.5-1.4-1.6v-4.4h-2.2v4.3c0,2.5,1.4,3.6,3.7,3.6C243.5,1091.8,244.9,1090.6,244.9,1088.2z M236.4,1091.6v-7.8h-2.2
			v5.9h-3.8v1.9L236.4,1091.6L236.4,1091.6z"
            />
            <path
              fill="#FFFFFF"
              d="M228.7,1091.6v-5.9h2.3v-1.9h-6.8v1.9h2.3v5.9H228.7L228.7,1091.6z"
            />
            <path
              fill="#FFFFFF"
              d="M251.8,1113v-15.7h-4.6l-3.7,6.1l-3.7-6.1h-4.6v15.7h4.3v-9l4,6.1h0.1l4-6.1v9L251.8,1113L251.8,1113z"
            />
            <path
              fill="#FFFFFF"
              d="M338.7,1130.2v-3l-0.8,3h-0.7l-0.8-3v3h-0.7v-3.9h1.2l0.7,2.6l0.7-2.6h1.2v3.9H338.7z M331.4,1130.2
			l1.6-3.9h0.8l1.5,3.9h-0.8l-0.3-0.9h-1.6l-0.3,0.9H331.4L331.4,1130.2z M333.9,1128.7l-0.5-1.4l-0.5,1.4H333.9z M328.6,1128.8
			c0.1,0.3,0.2,0.5,0.3,0.6c0.1,0.1,0.3,0.2,0.5,0.2c0.3,0,0.5-0.1,0.7-0.3c0.2-0.2,0.3-0.6,0.3-1c0-0.5-0.1-0.8-0.3-1
			c-0.2-0.2-0.4-0.3-0.7-0.3c-0.2,0-0.4,0.1-0.5,0.2c-0.1,0.1-0.2,0.3-0.3,0.5l-0.8-0.2c0.1-0.3,0.2-0.6,0.4-0.7
			c0.3-0.3,0.7-0.4,1.2-0.4c0.5,0,1,0.2,1.3,0.5c0.3,0.4,0.5,0.9,0.5,1.5c0,0.6-0.2,1.1-0.5,1.4c-0.3,0.4-0.8,0.5-1.3,0.5
			c-0.4,0-0.7-0.1-1-0.3c-0.3-0.2-0.5-0.5-0.6-1L328.6,1128.8L328.6,1128.8z M326.4,1130.2v-1.7h-1.5v1.7h-0.8v-3.9h0.8v1.5h1.5
			v-1.5h0.8v3.9H326.4z M322.5,1130.2v-3.9h0.8v3.9H322.5z M321.8,1130.2H321v-2.5l-1.6,2.5h-0.8v-3.9h0.7v2.6l1.6-2.6h0.8
			L321.8,1130.2L321.8,1130.2z M317.9,1130.2H315v-0.7h2.2v-1h-1.9v-0.7h1.9v-0.8H315v-0.7h2.9L317.9,1130.2L317.9,1130.2z
			 M312.3,1130.2h-0.9l-0.8-2.9l-0.8,2.9h-0.8l-0.9-3.9h0.8l0.6,2.7l0.7-2.7h0.9l0.7,2.6l0.6-2.6h0.8L312.3,1130.2L312.3,1130.2z"
            />
            <path
              fill="#FFFFFF"
              d="M304.5,1130.2l1.5-3.9h0.8l1.5,3.9h-0.8l-0.3-0.9h-1.5l-0.3,0.9H304.5L304.5,1130.2z M307,1128.7l-0.5-1.4
			l-0.5,1.4H307z M303.9,1129.9c-0.2,0.2-0.6,0.3-1.1,0.3c-0.3,0-0.6,0-0.8-0.1c-0.2-0.1-0.4-0.2-0.5-0.4c-0.1-0.2-0.2-0.4-0.2-0.6
			c0-0.2,0.1-0.5,0.2-0.6c0.1-0.2,0.2-0.3,0.4-0.4c0.2-0.1,0.5-0.2,0.8-0.3c0.4-0.1,0.6-0.2,0.7-0.2c0.1-0.1,0.1-0.1,0.1-0.2
			c0-0.1,0-0.2-0.1-0.2c-0.1-0.1-0.3-0.1-0.5-0.1c-0.2,0-0.4,0-0.5,0.1c-0.1,0.1-0.2,0.2-0.2,0.4l-0.8,0c0-0.4,0.1-0.6,0.4-0.8
			c0.2-0.2,0.6-0.3,1.1-0.3c0.3,0,0.6,0,0.8,0.1c0.2,0.1,0.4,0.2,0.5,0.4c0.1,0.2,0.2,0.4,0.2,0.5c0,0.3-0.1,0.6-0.4,0.8
			c-0.2,0.1-0.5,0.3-0.9,0.4c-0.3,0.1-0.5,0.1-0.6,0.2c-0.1,0-0.2,0.1-0.3,0.2c0,0.1-0.1,0.1-0.1,0.2c0,0.1,0.1,0.3,0.2,0.4
			c0.1,0.1,0.3,0.2,0.6,0.2c0.2,0,0.4-0.1,0.6-0.2c0.1-0.1,0.2-0.3,0.3-0.6l0.7,0.1C304.3,1129.4,304.1,1129.7,303.9,1129.9z
			 M299.8,1130.2v-1.7h-1.5v1.7h-0.8v-3.9h0.8v1.5h1.5v-1.5h0.8v3.9H299.8z M292.7,1128.8c0.1,0.3,0.2,0.5,0.3,0.6
			c0.1,0.1,0.3,0.2,0.5,0.2c0.3,0,0.5-0.1,0.7-0.3c0.2-0.2,0.3-0.6,0.3-1c0-0.5-0.1-0.8-0.3-1c-0.2-0.2-0.4-0.3-0.7-0.3
			c-0.2,0-0.4,0.1-0.5,0.2c-0.1,0.1-0.2,0.3-0.3,0.5l-0.8-0.2c0.1-0.3,0.2-0.6,0.4-0.7c0.3-0.3,0.7-0.4,1.2-0.4c0.5,0,1,0.2,1.3,0.5
			c0.3,0.4,0.5,0.9,0.5,1.5c0,0.6-0.2,1.1-0.5,1.4c-0.3,0.4-0.7,0.5-1.3,0.5c-0.4,0-0.8-0.1-1-0.3c-0.3-0.2-0.5-0.5-0.6-1
			L292.7,1128.8L292.7,1128.8z M290.9,1129.7c-0.4,0.4-0.8,0.5-1.4,0.5s-1-0.2-1.4-0.5c-0.3-0.4-0.5-0.8-0.5-1.5
			c0-0.6,0.2-1.1,0.5-1.5c0.3-0.4,0.8-0.5,1.4-0.5c0.3,0,0.6,0,0.8,0.1c0.2,0.1,0.3,0.2,0.5,0.4c0.2,0.1,0.3,0.3,0.4,0.5
			c0.1,0.3,0.2,0.6,0.2,1C291.4,1128.9,291.3,1129.4,290.9,1129.7z M290.6,1128.3c0-0.4-0.1-0.8-0.3-1c-0.2-0.2-0.5-0.3-0.8-0.3
			s-0.6,0.1-0.8,0.3c-0.2,0.2-0.3,0.5-0.3,1c0,0.5,0.1,0.8,0.3,1c0.2,0.2,0.5,0.3,0.8,0.3c0.3,0,0.6-0.1,0.8-0.3
			C290.5,1129,290.6,1128.7,290.6,1128.3L290.6,1128.3z M284.4,1130.2v-0.7h1.9v-3.2h0.8v3.8H284.4z M283.8,1126.3v3.9h-1.5
			c-0.3,0-0.5,0-0.7-0.1c-0.2-0.1-0.4-0.2-0.6-0.3c-0.2-0.2-0.3-0.4-0.4-0.7c-0.1-0.2-0.1-0.5-0.1-0.8c0-0.4,0-0.7,0.1-0.9
			c0.1-0.2,0.2-0.5,0.4-0.6c0.2-0.2,0.4-0.3,0.6-0.4c0.2-0.1,0.4-0.1,0.7-0.1L283.8,1126.3L283.8,1126.3z M283,1127h-0.4
			c-0.3,0-0.5,0-0.6,0c-0.1,0-0.3,0.1-0.4,0.2c-0.1,0.1-0.2,0.2-0.2,0.4c0,0.2-0.1,0.4-0.1,0.7s0,0.5,0.1,0.7
			c0.1,0.2,0.1,0.3,0.2,0.4c0.1,0.1,0.2,0.1,0.3,0.2c0.1,0,0.3,0,0.5,0h0.6L283,1127L283,1127z M277.3,1127.7
			c0.1-0.1,0.3-0.2,0.5-0.2c0.2,0,0.4,0.1,0.6,0.2c0.2,0.1,0.2,0.3,0.2,0.6c0,0.2-0.1,0.4-0.2,0.5c-0.1,0.2-0.3,0.2-0.6,0.2
			c-0.2,0-0.4-0.1-0.5-0.2c-0.1-0.1-0.2-0.3-0.2-0.5C277.1,1128.1,277.2,1127.9,277.3,1127.7z M275,1126.3v3.9h-1.5
			c-0.3,0-0.5,0-0.7-0.1c-0.2-0.1-0.4-0.2-0.5-0.3c-0.2-0.2-0.3-0.4-0.4-0.7c-0.1-0.2-0.1-0.5-0.1-0.8c0-0.4,0-0.7,0.1-0.9
			c0.1-0.2,0.2-0.5,0.4-0.6c0.2-0.2,0.4-0.3,0.6-0.4c0.2-0.1,0.4-0.1,0.7-0.1L275,1126.3L275,1126.3z M273.9,1127
			c-0.3,0-0.5,0-0.6,0c-0.1,0-0.3,0.1-0.4,0.2c-0.1,0.1-0.2,0.2-0.2,0.4c-0.1,0.2-0.1,0.4-0.1,0.7s0,0.5,0.1,0.7
			c0,0.2,0.1,0.3,0.2,0.4c0.1,0.1,0.2,0.1,0.3,0.2c0.1,0,0.2,0,0.5,0h0.6v-2.5H273.9z M270.8,1129.7c-0.3,0.4-0.8,0.5-1.4,0.5
			c-0.6,0-1-0.2-1.3-0.5c-0.4-0.4-0.5-0.8-0.5-1.5c0-0.6,0.2-1.1,0.5-1.5c0.3-0.4,0.8-0.5,1.4-0.5c0.3,0,0.6,0,0.8,0.1
			c0.2,0.1,0.3,0.2,0.5,0.4c0.1,0.1,0.3,0.3,0.4,0.5c0.1,0.3,0.2,0.6,0.2,1C271.3,1128.9,271.2,1129.4,270.8,1129.7z M270.5,1128.3
			c0-0.4-0.1-0.8-0.3-1c-0.2-0.2-0.5-0.3-0.8-0.3s-0.6,0.1-0.8,0.3c-0.2,0.2-0.3,0.5-0.3,1c0,0.5,0.1,0.8,0.3,1
			c0.2,0.2,0.5,0.3,0.8,0.3c0.3,0,0.6-0.1,0.8-0.3C270.4,1129,270.5,1128.7,270.5,1128.3L270.5,1128.3z M264.8,1130.2v-2.5l-1.6,2.5
			h-0.8v-3.9h0.7v2.6l1.6-2.6h0.7v3.9H264.8z M261.2,1129.7c-0.3,0.4-0.8,0.5-1.4,0.5c-0.6,0-1-0.2-1.3-0.5
			c-0.3-0.4-0.5-0.8-0.5-1.5c0-0.6,0.2-1.1,0.5-1.5c0.3-0.4,0.8-0.5,1.4-0.5c0.3,0,0.6,0,0.8,0.1c0.2,0.1,0.4,0.2,0.5,0.4
			c0.2,0.1,0.3,0.3,0.4,0.5c0.1,0.3,0.2,0.6,0.2,1C261.8,1128.9,261.6,1129.4,261.2,1129.7z M261,1128.3c0-0.4-0.1-0.8-0.3-1
			c-0.2-0.2-0.5-0.3-0.8-0.3c-0.3,0-0.6,0.1-0.8,0.3c-0.2,0.2-0.3,0.5-0.3,1c0,0.5,0.1,0.8,0.3,1c0.2,0.2,0.5,0.3,0.8,0.3
			c0.3,0,0.6-0.1,0.8-0.3C260.9,1129,261,1128.7,261,1128.3L261,1128.3z M256.5,1130.2h-0.8v-3.2h-1.1v-0.7h3v0.7h-1.1L256.5,1130.2
			L256.5,1130.2z M252.6,1130.2h-1.3c-0.5,0-0.8,0-0.9,0c-0.2,0-0.4-0.1-0.5-0.2c-0.1-0.1-0.2-0.2-0.3-0.4c-0.1-0.2-0.1-0.3-0.1-0.5
			c0-0.2,0.1-0.4,0.2-0.6c0.1-0.2,0.3-0.3,0.5-0.3c-0.2-0.1-0.3-0.2-0.4-0.4c-0.1-0.1-0.1-0.3-0.1-0.5c0-0.2,0-0.3,0.1-0.5
			c0.1-0.1,0.2-0.2,0.3-0.3c0.1-0.1,0.3-0.1,0.4-0.2s0.4,0,0.7,0h1.5V1130.2z M251.9,1127h-0.5c-0.4,0-0.6,0-0.7,0
			c-0.1,0-0.2,0.1-0.3,0.1c-0.1,0.1-0.1,0.2-0.1,0.3c0,0.1,0,0.2,0.1,0.3c0.1,0.1,0.2,0.1,0.3,0.1c0.1,0,0.3,0,0.6,0h0.5V1127
			L251.9,1127z M251.9,1128.5h-0.6c-0.4,0-0.6,0-0.7,0c-0.1,0-0.2,0.1-0.2,0.2c-0.1,0.1-0.1,0.2-0.1,0.3c0,0.1,0,0.2,0.1,0.3
			c0.1,0.1,0.2,0.1,0.3,0.2c0.1,0,0.2,0,0.5,0h0.7L251.9,1128.5L251.9,1128.5z M246,1130.2v-0.7h1.9v-3.2h0.8v3.8H246z
			 M245.5,1130.2h-2.9v-0.7h2.1v-1h-1.9v-0.7h1.9v-0.8h-2.1v-0.7h2.9L245.5,1130.2L245.5,1130.2z M238.4,1130.2l1.6-3.9h0.8l1.5,3.9
			h-0.8l-0.3-0.9h-1.6l-0.3,0.9H238.4L238.4,1130.2z M240.9,1128.7l-0.5-1.4l-0.5,1.4H240.9z M235.5,1128.8c0.1,0.3,0.2,0.5,0.3,0.6
			c0.1,0.1,0.3,0.2,0.5,0.2c0.3,0,0.5-0.1,0.7-0.3c0.2-0.2,0.3-0.6,0.3-1c0-0.5-0.1-0.8-0.3-1c-0.2-0.2-0.4-0.3-0.7-0.3
			c-0.2,0-0.4,0.1-0.5,0.2c-0.1,0.1-0.2,0.3-0.3,0.5l-0.8-0.2c0.1-0.3,0.2-0.6,0.4-0.7c0.3-0.3,0.7-0.4,1.1-0.4c0.5,0,1,0.2,1.3,0.5
			c0.3,0.4,0.5,0.9,0.5,1.5c0,0.6-0.2,1.1-0.5,1.4c-0.3,0.4-0.7,0.5-1.3,0.5c-0.4,0-0.7-0.1-1-0.3c-0.3-0.2-0.5-0.5-0.6-1
			L235.5,1128.8L235.5,1128.8z M233.3,1130.2v-1.7h-1.5v1.7H231v-3.9h0.8v1.5h1.5v-1.5h0.8v3.9H233.3z"
            />
            <path
              fill="#FFFFFF"
              d="M355,1136h-0.8v-3.2h-1.1v-0.6h3v0.6H355L355,1136L355,1136z M352.6,1132.2v2c0,0.4,0,0.8-0.1,1
			c0,0.1-0.1,0.3-0.2,0.4c-0.1,0.1-0.3,0.2-0.5,0.3c-0.2,0.1-0.5,0.1-0.8,0.1c-0.3,0-0.5,0-0.7-0.1c-0.2-0.1-0.3-0.2-0.5-0.3
			c-0.1-0.1-0.2-0.3-0.2-0.5c0-0.2-0.1-0.5-0.1-1v-2h0.8v2.1c0,0.3,0,0.5,0,0.7c0,0.1,0.1,0.2,0.2,0.3c0.1,0.1,0.3,0.1,0.5,0.1
			s0.4,0,0.5-0.1c0.1-0.1,0.2-0.2,0.2-0.4c0-0.1,0-0.3,0-0.7v-2.1H352.6L352.6,1132.2z M348,1136v-3l-0.8,3h-0.7l-0.8-3v3H345v-3.8
			h1.2l0.7,2.6l0.7-2.6h1.2v3.8H348z M344.2,1136h-1.3c-0.5,0-0.8,0-0.9,0c-0.2,0-0.4-0.1-0.5-0.2c-0.1-0.1-0.2-0.2-0.3-0.4
			c-0.1-0.2-0.1-0.3-0.1-0.5c0-0.2,0.1-0.4,0.2-0.6c0.1-0.2,0.3-0.3,0.5-0.4c-0.2-0.1-0.3-0.2-0.4-0.3c-0.1-0.1-0.1-0.3-0.1-0.5
			c0-0.2,0-0.3,0.1-0.5c0.1-0.1,0.2-0.2,0.3-0.3c0.1-0.1,0.2-0.1,0.4-0.2c0.1,0,0.4,0,0.7,0h1.5V1136z M343.4,1132.8H343
			c-0.4,0-0.6,0-0.7,0c-0.1,0-0.2,0.1-0.3,0.1c-0.1,0.1-0.1,0.2-0.1,0.3c0,0.1,0,0.2,0.1,0.3c0.1,0.1,0.2,0.1,0.3,0.1
			c0.1,0,0.3,0,0.6,0h0.5L343.4,1132.8L343.4,1132.8z M343.4,1134.3h-0.6c-0.4,0-0.6,0-0.7,0.1c-0.1,0-0.2,0.1-0.2,0.2
			c-0.1,0.1-0.1,0.2-0.1,0.3c0,0.1,0,0.2,0.1,0.3c0.1,0.1,0.2,0.1,0.3,0.1c0.1,0,0.3,0,0.5,0h0.7L343.4,1134.3L343.4,1134.3z
			 M337.6,1136v-0.6h1.9v-3.2h0.8v3.8H337.6z M337,1136h-2.9v-0.6h2.2v-1.1h-1.9v-0.6h1.9v-0.9h-2.1v-0.6h2.9L337,1136L337,1136z
			 M331.9,1132.2v3.8h-1.5c-0.3,0-0.5,0-0.7-0.1c-0.2-0.1-0.4-0.2-0.5-0.3c-0.2-0.2-0.3-0.4-0.4-0.7c-0.1-0.2-0.1-0.5-0.1-0.8
			c0-0.4,0-0.7,0.1-0.9c0.1-0.2,0.2-0.5,0.4-0.6c0.1-0.2,0.3-0.3,0.6-0.4c0.2-0.1,0.4-0.1,0.7-0.1L331.9,1132.2L331.9,1132.2z
			 M330.8,1132.8c-0.3,0-0.5,0-0.6,0c-0.1,0-0.3,0.1-0.4,0.2c-0.1,0.1-0.2,0.2-0.2,0.4c-0.1,0.1-0.1,0.4-0.1,0.7
			c0,0.3,0,0.5,0.1,0.7c0,0.2,0.1,0.3,0.2,0.4c0.1,0.1,0.2,0.1,0.3,0.2c0.1,0,0.2,0,0.5,0h0.6v-2.6H330.8z M328,1136h-0.8v-1.6h-0.2
			c-0.2,0-0.3,0-0.4,0c-0.1,0-0.1,0.1-0.2,0.2c-0.1,0.1-0.2,0.3-0.4,0.6l-0.6,0.8h-0.9l0.5-0.7c0.2-0.3,0.3-0.5,0.4-0.6
			c0.1-0.1,0.2-0.2,0.4-0.3c-0.3,0-0.6-0.2-0.8-0.4c-0.2-0.2-0.2-0.4-0.2-0.7c0-0.2,0.1-0.4,0.2-0.6c0.1-0.2,0.3-0.3,0.5-0.4
			c0.2-0.1,0.5-0.1,0.9-0.1h1.6L328,1136L328,1136z M327.3,1133.8v-1h-0.6c-0.3,0-0.5,0-0.6,0c-0.1,0-0.2,0.1-0.3,0.1
			c-0.1,0.1-0.1,0.2-0.1,0.3c0,0.1,0,0.2,0.1,0.3c0.1,0.1,0.1,0.1,0.2,0.2c0.1,0,0.3,0,0.7,0L327.3,1133.8L327.3,1133.8z"
            />
            <path
              fill="#FFFFFF"
              d="M322.6,1136v-1.6l-1.4-2.2h0.9l0.9,1.5l0.9-1.5h0.9l-1.4,2.2v1.6H322.6z"
            />
            <path
              fill="#FFFFFF"
              d="M316.6,1136v-0.6h1.9v-3.2h0.8v3.8H316.6z M315.8,1135.6c-0.4,0.4-0.8,0.5-1.4,0.5c-0.6,0-1-0.2-1.4-0.5
			c-0.3-0.4-0.5-0.8-0.5-1.5s0.2-1.1,0.5-1.5c0.3-0.4,0.8-0.5,1.4-0.5c0.3,0,0.6,0,0.8,0.1c0.2,0.1,0.3,0.2,0.5,0.4
			c0.2,0.2,0.3,0.3,0.4,0.5c0.1,0.3,0.2,0.6,0.2,1C316.3,1134.7,316.1,1135.2,315.8,1135.6z M315.4,1134.1c0-0.4-0.1-0.8-0.3-1
			c-0.2-0.2-0.5-0.3-0.8-0.3c-0.3,0-0.6,0.1-0.8,0.3c-0.2,0.2-0.3,0.5-0.3,1c0,0.5,0.1,0.8,0.3,1c0.2,0.2,0.5,0.3,0.8,0.3
			c0.3,0,0.6-0.1,0.8-0.3C315.3,1134.9,315.4,1134.5,315.4,1134.1L315.4,1134.1z M311.4,1136h-0.8l-0.8-2.9l-0.8,2.9h-0.8l-0.9-3.8
			h0.8l0.6,2.7l0.7-2.7h0.9l0.7,2.6l0.6-2.6h0.8L311.4,1136L311.4,1136z M304.2,1133.6c0.1-0.1,0.3-0.2,0.6-0.2
			c0.2,0,0.4,0.1,0.5,0.2c0.2,0.2,0.2,0.3,0.2,0.6c0,0.2-0.1,0.4-0.2,0.5c-0.1,0.2-0.3,0.2-0.5,0.2c-0.2,0-0.4-0.1-0.6-0.2
			c-0.1-0.2-0.2-0.3-0.2-0.6C304,1133.9,304.1,1133.7,304.2,1133.6z M299.5,1134.6c0.1,0.3,0.2,0.5,0.3,0.6c0.1,0.1,0.3,0.2,0.5,0.2
			c0.3,0,0.5-0.1,0.7-0.3c0.2-0.2,0.3-0.6,0.3-1c0-0.5-0.1-0.8-0.3-1c-0.2-0.2-0.4-0.3-0.7-0.3c-0.2,0-0.4,0.1-0.5,0.2
			c-0.1,0.1-0.2,0.3-0.3,0.5l-0.8-0.2c0.1-0.3,0.2-0.5,0.4-0.7c0.3-0.3,0.7-0.4,1.1-0.4c0.5,0,1,0.2,1.3,0.5
			c0.3,0.4,0.5,0.9,0.5,1.5c0,0.6-0.2,1.1-0.5,1.4c-0.3,0.3-0.7,0.5-1.3,0.5c-0.4,0-0.7-0.1-1-0.3c-0.3-0.2-0.5-0.5-0.6-1
			L299.5,1134.6L299.5,1134.6z M297.7,1135.6c-0.3,0.4-0.8,0.5-1.4,0.5s-1-0.2-1.3-0.5c-0.4-0.4-0.5-0.8-0.5-1.5
			c0-0.6,0.2-1.1,0.5-1.5c0.3-0.4,0.8-0.5,1.4-0.5c0.3,0,0.6,0,0.8,0.1c0.2,0.1,0.3,0.2,0.5,0.4c0.1,0.2,0.3,0.3,0.4,0.5
			c0.1,0.3,0.2,0.6,0.2,1C298.2,1134.7,298.1,1135.2,297.7,1135.6z M297.4,1134.1c0-0.4-0.1-0.8-0.3-1c-0.2-0.2-0.5-0.3-0.8-0.3
			c-0.3,0-0.6,0.1-0.8,0.3c-0.2,0.2-0.3,0.5-0.3,1c0,0.5,0.1,0.8,0.3,1c0.2,0.2,0.5,0.3,0.8,0.3c0.3,0,0.6-0.1,0.8-0.3
			C297.3,1134.9,297.4,1134.5,297.4,1134.1L297.4,1134.1z M293.5,1135.6c-0.3,0.4-0.8,0.5-1.4,0.5s-1-0.2-1.4-0.5
			c-0.3-0.4-0.5-0.8-0.5-1.5s0.2-1.1,0.5-1.5c0.3-0.4,0.8-0.5,1.4-0.5c0.3,0,0.6,0,0.8,0.1c0.2,0.1,0.3,0.2,0.5,0.4
			c0.1,0.2,0.3,0.3,0.4,0.5c0.1,0.3,0.2,0.6,0.2,1C294,1134.7,293.9,1135.2,293.5,1135.6z M293.2,1134.1c0-0.4-0.1-0.8-0.3-1
			c-0.2-0.2-0.5-0.3-0.8-0.3s-0.6,0.1-0.8,0.3c-0.2,0.2-0.3,0.5-0.3,1c0,0.5,0.1,0.8,0.3,1c0.2,0.2,0.5,0.3,0.8,0.3
			c0.3,0,0.6-0.1,0.8-0.3C293.1,1134.9,293.2,1134.5,293.2,1134.1L293.2,1134.1z M287,1136v-0.6h1.9v-3.2h0.8v3.8H287z"
            />
            <path
              fill="#FFFFFF"
              d="M284.3,1136v-3.8h0.8v3.8H284.3z M283.5,1136h-0.8v-1.6h-0.2c-0.2,0-0.3,0-0.4,0c-0.1,0-0.2,0.1-0.2,0.2
			s-0.2,0.3-0.4,0.6l-0.6,0.8h-0.9l0.5-0.7c0.2-0.3,0.3-0.5,0.5-0.6c0.1-0.1,0.2-0.2,0.4-0.3c-0.3,0-0.6-0.2-0.8-0.4
			c-0.2-0.2-0.2-0.4-0.2-0.7c0-0.2,0-0.4,0.2-0.6c0.1-0.2,0.3-0.3,0.5-0.4c0.2-0.1,0.5-0.1,0.9-0.1h1.6L283.5,1136L283.5,1136z
			 M282.7,1133.8v-1h-0.6c-0.3,0-0.5,0-0.6,0c-0.1,0-0.2,0.1-0.3,0.1c-0.1,0.1-0.1,0.2-0.1,0.3c0,0.1,0,0.2,0.1,0.3
			c0,0.1,0.1,0.1,0.2,0.2c0.1,0,0.3,0,0.7,0L282.7,1133.8L282.7,1133.8z M279.8,1134.1c0,0.6-0.2,1.1-0.5,1.4
			c-0.3,0.4-0.8,0.5-1.4,0.5c-0.6,0-1-0.2-1.4-0.5c-0.3-0.4-0.5-0.8-0.5-1.5s0.2-1.1,0.5-1.5c0.3-0.4,0.8-0.5,1.4-0.5
			c0.3,0,0.6,0,0.8,0.1c0.2,0.1,0.4,0.2,0.5,0.4c0.2,0.2,0.3,0.3,0.4,0.5C279.7,1133.4,279.8,1133.7,279.8,1134.1L279.8,1134.1z
			 M279,1134.1c0-0.4-0.1-0.8-0.3-1c-0.2-0.2-0.5-0.3-0.8-0.3c-0.3,0-0.6,0.1-0.8,0.3c-0.2,0.2-0.3,0.5-0.3,1c0,0.5,0.1,0.8,0.3,1
			c0.2,0.2,0.5,0.3,0.8,0.3s0.6-0.1,0.8-0.3C278.9,1134.9,279,1134.5,279,1134.1L279,1134.1z M275.5,1136h-0.7v-2.5l-1.6,2.5h-0.8
			v-3.8h0.7v2.6l1.6-2.6h0.8L275.5,1136L275.5,1136z"
            />
            <path
              fill="#FFFFFF"
              d="M269.3,1133.9c0.1-0.1,0.3-0.2,0.5-0.2c0.2,0,0.4,0.1,0.5,0.2c0.1,0.1,0.2,0.3,0.2,0.5
			c0,0.2-0.1,0.4-0.2,0.5c-0.1,0.1-0.3,0.2-0.5,0.2c-0.2,0-0.4-0.1-0.5-0.2c-0.1-0.1-0.2-0.3-0.2-0.5
			C269.1,1134.1,269.2,1134,269.3,1133.9z"
            />
            <path
              fill="#FFFFFF"
              d="M267.3,1132.2v3.8h-1.5c-0.3,0-0.5,0-0.7-0.1c-0.2-0.1-0.4-0.2-0.6-0.3c-0.2-0.2-0.3-0.4-0.4-0.7
			c-0.1-0.2-0.1-0.5-0.1-0.8c0-0.4,0-0.7,0.1-0.9c0.1-0.2,0.2-0.5,0.4-0.6c0.1-0.2,0.4-0.3,0.6-0.4c0.2-0.1,0.4-0.1,0.7-0.1
			L267.3,1132.2L267.3,1132.2z M266.5,1132.8h-0.4c-0.3,0-0.5,0-0.6,0c-0.1,0-0.3,0.1-0.4,0.2c-0.1,0.1-0.2,0.2-0.2,0.4
			c0,0.1-0.1,0.4-0.1,0.7c0,0.3,0,0.5,0.1,0.7c0.1,0.2,0.1,0.3,0.2,0.4c0.1,0.1,0.2,0.1,0.3,0.2c0.1,0,0.2,0,0.5,0h0.6L266.5,1132.8
			L266.5,1132.8z M263,1135.6c-0.3,0.4-0.8,0.5-1.4,0.5c-0.6,0-1-0.2-1.3-0.5c-0.3-0.4-0.5-0.8-0.5-1.5c0-0.6,0.2-1.1,0.5-1.5
			c0.3-0.4,0.8-0.5,1.4-0.5c0.3,0,0.6,0,0.8,0.1c0.2,0.1,0.4,0.2,0.5,0.4c0.2,0.2,0.3,0.3,0.4,0.5c0.1,0.3,0.2,0.6,0.2,1
			C263.5,1134.7,263.4,1135.2,263,1135.6z M262.7,1134.1c0-0.4-0.1-0.8-0.3-1c-0.2-0.2-0.5-0.3-0.8-0.3c-0.3,0-0.6,0.1-0.8,0.3
			c-0.2,0.2-0.3,0.5-0.3,1c0,0.5,0.1,0.8,0.3,1c0.2,0.2,0.5,0.3,0.8,0.3c0.3,0,0.6-0.1,0.8-0.3
			C262.6,1134.9,262.7,1134.5,262.7,1134.1L262.7,1134.1z M257.7,1136H257v-2.5l-1.6,2.5h-0.8v-3.8h0.7v2.6l1.6-2.6h0.7L257.7,1136
			L257.7,1136z M254,1134.1c0,0.6-0.2,1.1-0.5,1.4c-0.3,0.4-0.8,0.5-1.4,0.5s-1-0.2-1.4-0.5c-0.3-0.4-0.5-0.8-0.5-1.5
			s0.2-1.1,0.5-1.5c0.4-0.4,0.8-0.5,1.4-0.5c0.3,0,0.6,0,0.8,0.1c0.2,0.1,0.4,0.2,0.5,0.4c0.2,0.2,0.3,0.3,0.4,0.5
			C253.9,1133.4,254,1133.7,254,1134.1L254,1134.1z M253.2,1134.1c0-0.4-0.1-0.8-0.3-1c-0.2-0.2-0.5-0.3-0.8-0.3
			c-0.3,0-0.6,0.1-0.8,0.3c-0.2,0.2-0.3,0.5-0.3,1c0,0.5,0.1,0.8,0.3,1c0.2,0.2,0.5,0.3,0.8,0.3c0.3,0,0.6-0.1,0.8-0.3
			C253.1,1134.9,253.2,1134.5,253.2,1134.1L253.2,1134.1z M248.8,1136H248v-3.2h-1.1v-0.6h3.1v0.6h-1.1L248.8,1136L248.8,1136z
			 M244.8,1132.2v3.8h-1.5c-0.3,0-0.5,0-0.7-0.1c-0.2-0.1-0.4-0.2-0.5-0.3c-0.2-0.2-0.3-0.4-0.4-0.7c-0.1-0.2-0.1-0.5-0.1-0.8
			c0-0.4,0-0.7,0.1-0.9c0.1-0.2,0.2-0.5,0.4-0.6c0.1-0.2,0.4-0.3,0.6-0.4c0.2-0.1,0.4-0.1,0.7-0.1L244.8,1132.2L244.8,1132.2z
			 M243.7,1132.8c-0.3,0-0.5,0-0.6,0c-0.1,0-0.2,0.1-0.4,0.2c-0.1,0.1-0.2,0.2-0.2,0.4c-0.1,0.1-0.1,0.4-0.1,0.7
			c0,0.3,0,0.5,0.1,0.7c0,0.2,0.1,0.3,0.2,0.4c0.1,0.1,0.2,0.1,0.3,0.2c0.1,0,0.2,0,0.5,0h0.6v-2.6H243.7z M241,1136h-0.8v-1.6H240
			c-0.2,0-0.3,0-0.4,0c-0.1,0-0.1,0.1-0.2,0.2c-0.1,0.1-0.2,0.3-0.4,0.6l-0.5,0.8h-0.9l0.5-0.7c0.2-0.3,0.3-0.5,0.4-0.6
			c0.1-0.1,0.2-0.2,0.4-0.3c-0.3,0-0.6-0.2-0.8-0.4c-0.2-0.2-0.2-0.4-0.2-0.7c0-0.2,0.1-0.4,0.2-0.6c0.1-0.2,0.3-0.3,0.5-0.4
			c0.2-0.1,0.5-0.1,0.9-0.1h1.7L241,1136L241,1136z M240.2,1133.8v-1h-0.6c-0.3,0-0.5,0-0.6,0c-0.1,0-0.2,0.1-0.3,0.1
			c-0.1,0.1-0.1,0.2-0.1,0.3c0,0.1,0,0.2,0.1,0.3c0.1,0.1,0.1,0.1,0.2,0.2c0.1,0,0.3,0,0.7,0L240.2,1133.8L240.2,1133.8z"
            />
            <path
              fill="#FFFFFF"
              d="M235.5,1136v-1.6l-1.4-2.2h0.9l0.9,1.5l0.9-1.5h0.9l-1.4,2.2v1.6H235.5z"
            />
            <path
              fill="#FFFFFF"
              d="M229.8,1134.6c0.1,0.3,0.2,0.5,0.3,0.6c0.1,0.1,0.3,0.2,0.5,0.2c0.3,0,0.5-0.1,0.7-0.3
			c0.2-0.2,0.3-0.6,0.3-1c0-0.5-0.1-0.8-0.3-1c-0.2-0.2-0.4-0.3-0.7-0.3c-0.2,0-0.4,0.1-0.5,0.2c-0.1,0.1-0.2,0.3-0.3,0.5l-0.8-0.2
			c0.1-0.3,0.2-0.5,0.4-0.7c0.3-0.3,0.7-0.4,1.1-0.4c0.5,0,1,0.2,1.3,0.5c0.3,0.4,0.5,0.9,0.5,1.5c0,0.6-0.2,1.1-0.5,1.4
			c-0.3,0.3-0.7,0.5-1.3,0.5c-0.4,0-0.7-0.1-1-0.3c-0.3-0.2-0.5-0.5-0.6-1L229.8,1134.6L229.8,1134.6z M225.7,1136v-0.6h1.9v-3.2
			h0.8v3.8H225.7z M225.1,1136h-2.9v-0.6h2.2v-1.1h-1.9v-0.6h1.9v-0.9h-2.1v-0.6h2.9L225.1,1136L225.1,1136z M218.1,1136l1.5-3.8
			h0.8l1.5,3.8h-0.8l-0.3-0.9h-1.5l-0.3,0.9H218.1L218.1,1136z M220.5,1134.5l-0.5-1.4l-0.5,1.4H220.5z M216.9,1136v-2.5l-1.6,2.5
			h-0.8v-3.8h0.7v2.6l1.6-2.6h0.7v3.8H216.9z"
            />
            <path
              d="M355.6,1102h1.7l-2.6,5.8h-1.6l-1.8-3.8l-1.8,3.8h-1.6l-2.6-5.8h1.7l1.7,3.9l1.7-3.8h1.6l1.7,3.8L355.6,1102L355.6,1102z
			 M340.7,1102c0.5,0,1,0.2,1.3,0.5c0.4,0.3,0.5,0.7,0.5,1.2v2.4c0,0.5-0.2,0.9-0.5,1.2c-0.4,0.3-0.8,0.5-1.3,0.5h-4.5
			c-0.5,0-1-0.2-1.3-0.5c-0.4-0.3-0.5-0.7-0.5-1.2v-2.4c0-0.5,0.2-0.9,0.5-1.2c0.4-0.3,0.8-0.5,1.3-0.5H340.7z M340.3,1103.3h-3.6
			c-0.2,0-0.4,0.1-0.5,0.2c-0.1,0.1-0.2,0.3-0.2,0.5v1.8c0,0.2,0.1,0.3,0.2,0.5c0.1,0.1,0.3,0.2,0.5,0.2h3.6c0.2,0,0.4-0.1,0.5-0.2
			c0.1-0.1,0.2-0.3,0.2-0.5v-1.8c0-0.2-0.1-0.4-0.2-0.5l0,0C340.6,1103.4,340.5,1103.3,340.3,1103.3z M329.3,1102
			c0.5,0,1,0.2,1.3,0.5c0.4,0.3,0.5,0.7,0.5,1.2v2.4c0,0.5-0.2,0.9-0.5,1.2c-0.4,0.3-0.8,0.5-1.3,0.5h-4.5c-0.5,0-1-0.2-1.3-0.5
			c-0.4-0.3-0.5-0.7-0.5-1.2v-2.4c0-0.5,0.2-0.9,0.5-1.2c0.4-0.3,0.8-0.5,1.3-0.5H329.3z M328.9,1103.3h-3.6c-0.2,0-0.4,0.1-0.5,0.2
			c-0.1,0.1-0.2,0.3-0.2,0.5v1.8c0,0.2,0.1,0.3,0.2,0.5c0.1,0.1,0.3,0.2,0.5,0.2h3.6c0.2,0,0.4-0.1,0.5-0.2c0.1-0.1,0.2-0.3,0.2-0.5
			v-1.8c0-0.2-0.1-0.4-0.2-0.5l0,0C329.3,1103.4,329.1,1103.3,328.9,1103.3z M319.8,1102v1.3h-3v4.5h-1.6v-4.5h-3v-1.3H319.8z
			 M302,1102h7.1v5.8H302v-1.3h5.5v-1h-4.8v-1.3h4.8v-0.9H302V1102L302,1102z M293.1,1102h5.7v5.8h-1.6v-2.1h-2.6l-1.7,2.1H291
			l1.9-2.1c-0.5-0.1-0.9-0.3-1.3-0.6c-0.4-0.4-0.5-0.7-0.5-1.2c0-0.5,0.2-1,0.6-1.3C292.1,1102.2,292.6,1102,293.1,1102L293.1,1102z
			 M297.2,1103.3h-3.9c-0.2,0-0.3,0-0.4,0.1c-0.1,0.1-0.2,0.2-0.2,0.4c0,0.2,0.1,0.3,0.2,0.4c0.1,0.1,0.3,0.1,0.4,0.1h3.9l0,0
			V1103.3z M347.3,1115.5L347.3,1115.5l-0.5,0.1v-2h-4.6c-0.2,0-0.3,0-0.5,0c-0.1,0-0.3-0.1-0.4-0.2s-0.2-0.1-0.4-0.2
			c-0.1-0.1-0.2-0.2-0.3-0.3c-0.1-0.1-0.1-0.3-0.2-0.4c0-0.2-0.1-0.4-0.1-0.5c0-0.1,0-0.3,0.1-0.4c0-0.1,0.1-0.2,0.2-0.4
			c0.1-0.1,0.2-0.2,0.3-0.3c0.1-0.1,0.2-0.2,0.4-0.2c0.1-0.1,0.3-0.1,0.4-0.2c0.1,0,0.3,0,0.5,0h5L347.3,1115.5L347.3,1115.5z
			 M296.5,1110.4L296.5,1110.4l0.5-0.1v5.2h-6v-0.4h5.5V1110.4L296.5,1110.4z M311,1110.8c0.1-0.1,0.2-0.2,0.4-0.2
			c0.1-0.1,0.3-0.1,0.4-0.2c0.1,0,0.3,0,0.5,0h5.1v5.2h-0.5v-2h-3.7l-1.6,2H311l1.6-2h-0.4c-0.2,0-0.3,0-0.5,0
			c-0.1,0-0.3-0.1-0.4-0.2c-0.1-0.1-0.2-0.1-0.4-0.2c-0.1-0.1-0.2-0.2-0.3-0.3c-0.1-0.1-0.1-0.3-0.2-0.4c0-0.2-0.1-0.4-0.1-0.5
			c0-0.1,0-0.3,0.1-0.4c0-0.1,0.1-0.2,0.2-0.4C310.8,1111,310.9,1110.9,311,1110.8L311,1110.8z M311.8,1113.1
			c0.2,0.1,0.4,0.1,0.6,0.1h4.4v-2.5h-4.4c-0.2,0-0.4,0-0.6,0.1c-0.2,0-0.3,0.1-0.4,0.2c-0.1,0.1-0.2,0.2-0.3,0.4
			c-0.1,0.1-0.1,0.3-0.1,0.5c0,0.2,0,0.4,0.1,0.6c0.1,0.2,0.1,0.3,0.2,0.4l0,0C311.5,1113,311.6,1113.1,311.8,1113.1z M323.7,1110.4
			L323.7,1110.4l0.4,0c1.1,1.7,2.2,3.5,3.3,5.2h-0.5l-0.8-1.2h-4.4l-0.8,1.2h-0.5C321.5,1113.9,322.6,1112.1,323.7,1110.4
			L323.7,1110.4z M321.9,1114h3.9l-2-3.1L321.9,1114z M353.7,1110.4L353.7,1110.4l0.4,0c1.1,1.7,2.2,3.5,3.3,5.2h-0.5l-0.8-1.2h-4.4
			l-0.8,1.2h-0.5C351.5,1113.9,352.7,1112.1,353.7,1110.4L353.7,1110.4z M352,1114h3.9l-2-3.1L352,1114z M337.3,1115.6h-0.5v-2h-4.6
			c-0.2,0-0.3,0-0.5,0s-0.3-0.1-0.4-0.2s-0.3-0.1-0.4-0.2c-0.1-0.1-0.2-0.2-0.3-0.3c-0.1-0.1-0.1-0.3-0.2-0.4c0-0.2-0.1-0.4-0.1-0.5
			c0-0.1,0-0.3,0.1-0.4c0-0.1,0.1-0.2,0.2-0.4c0.1-0.1,0.2-0.2,0.3-0.3c0.1-0.1,0.2-0.2,0.4-0.2c0.1-0.1,0.3-0.1,0.4-0.2
			c0.2,0,0.3,0,0.5,0h5V1115.6L337.3,1115.6z M336.8,1110.7h-4.4c-0.2,0-0.4,0-0.6,0.1c-0.2,0-0.3,0.1-0.4,0.2
			c-0.1,0.1-0.2,0.2-0.3,0.4c-0.1,0.1-0.1,0.3-0.1,0.5c0,0.2,0,0.4,0.1,0.6c0.1,0.2,0.1,0.3,0.2,0.4l0,0c0.1,0.1,0.2,0.1,0.4,0.2
			c0.2,0.1,0.4,0.1,0.6,0.1h4.4V1110.7z M306.9,1115.6h-6v-0.4h5.5v-2h-4.8v-0.4h4.8v-2h-5.5v-0.4h6V1115.6L306.9,1115.6z
			 M346.8,1110.7h-4.4c-0.2,0-0.4,0-0.6,0.1c-0.2,0-0.3,0.1-0.4,0.2c-0.1,0.1-0.2,0.2-0.3,0.4c-0.1,0.1-0.1,0.3-0.1,0.5
			c0,0.2,0,0.4,0.1,0.6c0.1,0.2,0.1,0.3,0.2,0.4l0,0c0.1,0.1,0.2,0.1,0.4,0.2c0.2,0.1,0.4,0.1,0.6,0.1h4.4V1110.7z"
            />
            <path
              fill="#56B5E5"
              d="M321.4,1085.8c-1-1-2.4-1.5-3.7-1.5c-1.3,0-2.7,0.5-3.7,1.5c-1,1-1.5,2.4-1.5,3.7c0,1.3,0.5,2.7,1.5,3.7
			c1,1,2.4,1.5,3.7,1.5c1.3,0,2.7-0.5,3.7-1.5l0.8-0.8l2,2l-0.8,0.8c-1.6,1.6-3.6,2.4-5.7,2.4c-2.1,0-4.1-0.8-5.7-2.4
			c-1.6-1.6-2.4-3.6-2.4-5.7c0-2.1,0.8-4.1,2.4-5.7c1.6-1.6,3.6-2.4,5.7-2.4c2.1,0,4.1,0.8,5.7,2.4l5,5c0.6,0.6,0.6,1.4,0,2
			c-0.6,0.6-1.4,0.6-2,0L321.4,1085.8z"
            />
            <path
              fill="#EF4E4B"
              d="M327,1093.2c1,1,2.4,1.6,3.7,1.6c1.3,0,2.7-0.5,3.7-1.6c1-1,1.5-2.4,1.5-3.7c0-1.3-0.5-2.7-1.5-3.7
			c-1-1-2.4-1.5-3.7-1.5c-1.3,0-2.7,0.5-3.7,1.5l-0.8,0.8l-2-2l0.8-0.8c1.6-1.6,3.6-2.4,5.7-2.4c2.1,0,4.1,0.8,5.7,2.4
			c1.6,1.6,2.4,3.6,2.4,5.7c0,2.1-0.8,4.1-2.4,5.7c-1.6,1.6-3.6,2.4-5.7,2.4c-2.1,0-4.1-0.8-5.7-2.4l-5-5c-0.6-0.6-0.6-1.5,0-2
			c0.6-0.6,1.4-0.6,2,0L327,1093.2z"
            />
          </g>
        </g>
      </svg>
    </>
  );
});
export default ThreeScene;
