import { Box, Container, Flex, Heading } from "@chakra-ui/react";
import { faArrowPointer, faCircle, faMinus, faPaintBrush, faPalette, faSquare, faWorm } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SVG, Shape, Svg } from "@svgdotjs/svg.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { SelectActionContext, SelectConfigActionContext } from "../../context";
import { ActionType, ShapeConfigActionType } from "../../enums";
import { FreeHandPointProps, ShapeProps } from "../../types";
import { downloadSvg, updateShape } from "../../utils/SvgEditor";
import { EditorMenu } from "./Menu";
import { SelectActionButton } from "./SelectActionButton";
import { SelectConfigActionButton } from "./SelectConfigActionButton";

export const SvgEditor: React.FC = () => {
  const [currentAction, setCurrentAction] = useState(ActionType.EDIT);
  const [currentConfigAction, setCurrentConfigAction] = useState(ShapeConfigActionType.COLOR);
  const [svg, setSvg] = useState<Svg>();
  const [svgElements, setSvgElements] = useState<Shape[]>([]);
  const [history, setHistory] = useState<Shape[]>([]);
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
  const [freeHandPoints, setFreeHandPoints] = useState<Array<FreeHandPointProps>>([]);

  const svgRef = useRef<SVGSVGElement>(null);
  const selectedElement = useRef<Shape>();
  const currentShapeProps = useRef<ShapeProps>({
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    width: 0,
    height: 0,
  });

  const onMouseMove = useCallback((e: MouseEvent) =>
    updateShape(e, currentAction, currentShapeProps, selectedElement, freeHandPoints), [currentAction, freeHandPoints]);

  useEffect(() => {

    if (svgRef.current && !svg) {
      setSvg(SVG(svgRef.current));
      svgRef.current.style.cursor = "crosshair";
    }

    svgRef.current && (svgRef.current.onmousedown = (e) => {
      if (isMouseDown === false) {
        currentShapeProps.current = {
          x1: e.offsetX,
          y1: e.offsetY,
          x2: e.offsetX,
          y2: e.offsetY,
          width: 0,
          height: 0,
        }
        let newElement;

        if (currentAction === ActionType.ELLIPSE) {
          newElement = svg?.ellipse(0, 0).move(e.offsetX, e.offsetY);
        } else if (currentAction === ActionType.SQUARE) {
          newElement = svg?.rect(0, 0).move(e.offsetX, e.offsetY);
        } else if (currentAction === ActionType.LINE) {
          newElement = svg?.line(e.offsetX, e.offsetY, e.offsetX, e.offsetY).stroke({ width: 1 })
        } else if (currentAction === ActionType.FREE_HAND) {
          setFreeHandPoints([{ x: e.offsetX, y: e.offsetY }]);
          newElement = svg?.path(`M${e.offsetX} ${e.offsetY}`).fill("none").stroke({ width: 5, color: "black" });
        }

        if (newElement) {
          setSvgElements([...svgElements, newElement!]);
          selectedElement.current = newElement;

          svgRef.current && (svgRef.current.onmousemove = onMouseMove);
        }
      }
      setIsMouseDown(true);
    });

    svgRef.current && (svgRef.current.onmouseup = (e) => {
      setIsMouseDown(false);
      selectedElement.current = undefined;
      svgRef.current && (svgRef.current.onmousemove = null);
      setFreeHandPoints([]);
    });
  }, [svg, svgElements, isMouseDown, onMouseMove, currentAction]);

  const updateActiveAction = (actionType: ActionType) => setCurrentAction(actionType);
  const updateActiveConfigAction = (configActionType: ShapeConfigActionType) => setCurrentConfigAction(configActionType);

  const undo = () => {
    let shape = [...svgElements].pop();
    if (shape) {
      setSvgElements(svgElements);
      setHistory([...history, shape!])
      shape?.remove();
    }
  };

  const redo = () => {
    let shape = [...history].pop();
    if (shape) {
      setHistory(history);
      setSvgElements([...svgElements, shape!])
      svg?.add(shape!);
    }
  };

  window.onkeydown = (e) => {
    e.preventDefault();
    if (e.ctrlKey && e.key === "z") {
      undo();
    } else if (e.ctrlKey && e.key === "y") {
      redo();
    } else if (e.ctrlKey && e.shiftKey && e.key === "D") {
      downloadSvg(svgRef.current!, "svg.svg");
    } else if (e.altKey && e.key === "1") {
      updateActiveAction(ActionType.EDIT);
    } else if (e.altKey && e.key === "2") {
      updateActiveAction(ActionType.ELLIPSE);
    } else if (e.altKey && e.key === "3") {
      updateActiveAction(ActionType.SQUARE);
    } else if (e.altKey && e.key === "4") {
      updateActiveAction(ActionType.LINE);
    } else if (e.altKey && e.key === "5") {
      updateActiveAction(ActionType.FREE_HAND);
    }
  };

  return (
    <Container maxW={"full"} p={0}>
      <Flex h="12" bg="blackAlpha.800" alignItems={"center"}>
        <Heading color={"white"} as={"h1"} size={"md"} ml={12} mr={6}>
          Svg Editor
        </Heading>
        <Box fontSize={13}>
          <EditorMenu menuTitle="Ficheiro" menuItems={[
            {
              title: "Exportar como SVG",
              shortcut: "Ctrl + Shift + D",
              onClick: () => { downloadSvg(svgRef.current!, "svg.svg") }
            },
          ]} />
          <EditorMenu menuTitle="Editar" menuItems={[
            {
              title: "Desfazer",
              shortcut: "Ctrl + Z",
              onClick: undo
            },
            {
              title: "Refazer",
              shortcut: "Ctrl + Y",
              onClick: redo
            },
          ]} />
          <EditorMenu menuTitle="Ver" menuItems={[
            { title: "Aumentar Zoom", onClick: () => { } },
            { title: "Diminuir Zoom", onClick: () => { } },
          ]} />
          <EditorMenu menuTitle="Objeto" menuItems={[
            { title: "Trazer para a frente", onClick: () => { } },
            { title: "Enviar para trás", onClick: () => { } },
          ]} />
          <EditorMenu menuTitle="Ajuda" menuItems={[
            { title: "Sobre o editor", onClick: () => { } },
            { title: "Manual do editor", onClick: () => { } },
          ]} />
        </Box>
      </Flex>
      <Flex minH="calc(100vh - 96px)">
        <SelectActionContext.Provider value={currentAction}>
          <Flex w="12" bg="blackAlpha.800" flexDir="column">
            <SelectActionButton title="Editar" actionType={ActionType.EDIT} onClick={updateActiveAction}>
              <FontAwesomeIcon icon={faArrowPointer} fontSize="18" color="white" />
            </SelectActionButton>
            <SelectActionButton title="Desenhar círculo" actionType={ActionType.ELLIPSE} onClick={updateActiveAction}>
              <FontAwesomeIcon icon={faCircle} fontSize="18" color="white" />
            </SelectActionButton>
            <SelectActionButton title="Desenhar Quadrado" actionType={ActionType.SQUARE} onClick={updateActiveAction}>
              <FontAwesomeIcon icon={faSquare} fontSize="18" color="white" />
            </SelectActionButton>
            <SelectActionButton title="Desenhar Linha" actionType={ActionType.LINE} onClick={updateActiveAction}>
              <FontAwesomeIcon icon={faMinus} fontSize="18" color="white" />
            </SelectActionButton>
            <SelectActionButton title="Desenho livre" actionType={ActionType.FREE_HAND} onClick={updateActiveAction}>
              <FontAwesomeIcon icon={faPaintBrush} fontSize="18" color="white" />
            </SelectActionButton>
          </Flex>
          <svg ref={svgRef}
            style={{
              display: "flex",
              flex: "1",
            }} />
        </SelectActionContext.Provider>
        <SelectConfigActionContext.Provider value={currentConfigAction}>
          <Flex w="12" bg="blackAlpha.800" flexDir="column">
            <SelectConfigActionButton title="Definições do preenchimento" configActionType={ShapeConfigActionType.COLOR} onClick={updateActiveConfigAction}>
              <FontAwesomeIcon icon={faPalette} fontSize="18" color="white" />
            </SelectConfigActionButton>
            <SelectConfigActionButton title="Definições das bordas" configActionType={ShapeConfigActionType.GEOMETRY} onClick={updateActiveConfigAction}>
              <FontAwesomeIcon icon={faWorm} fontSize="18" color="white" />
            </SelectConfigActionButton>
          </Flex>
        </SelectConfigActionContext.Provider>
      </Flex>
      <Flex justifyContent={"center"} alignItems={"center"} textAlign={"center"} h={"12"} bg={"blackAlpha.800"}>
        <Box color={"white"} fontSize={"sm"}>
          &copy; {new Date().getFullYear()} Svg Editor | All rights reserved
        </Box>
      </Flex>
    </Container >
  )
};

export default SvgEditor;