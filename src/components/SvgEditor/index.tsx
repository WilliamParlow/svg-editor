import { Box, Container, Flex, Heading } from "@chakra-ui/react";
import { faArrowPointer, faCircle, faHandPointer, faMinus, faPaintBrush, faPalette, faSquare, faWorm } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Ellipse, Line, Path, Rect, SVG, Shape, Svg } from "@svgdotjs/svg.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { SelectActionContext } from "../../context";
import { ActionType } from "../../enums";
import { EditorMenu } from "./Menu";
import { SelectActionButton } from "./SelectActionButton";

type ShapeProps = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  height: number;
};

type FreeHandPointProps = {
  x: number;
  y: number;
}

export const SvgEditor: React.FC = () => {
  const [currentAction, setCurrentAction] = useState(ActionType.TRANSFORM);
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

  const onMouseMove = useCallback((e: MouseEvent) => {

    currentShapeProps.current = {
      ...currentShapeProps.current,
      x2: e.offsetX,
      y2: e.offsetY,
      width: Math.abs(e.offsetX - currentShapeProps.current.x1),
      height: Math.abs(e.offsetY - currentShapeProps.current.y1),
    };

    if (currentAction === ActionType.ELLIPSE) {

      (selectedElement.current as Ellipse).move(currentShapeProps.current.x1, currentShapeProps.current.y1)
        .radius(currentShapeProps.current.width, currentShapeProps.current.height);

    } else if (currentAction === ActionType.SQUARE) {

      (selectedElement.current as Rect).move(currentShapeProps.current.x1, currentShapeProps.current.y1)
        .width(currentShapeProps.current.width).height(currentShapeProps.current.height);

    } else if (currentAction === ActionType.LINE) {

      (selectedElement.current as Line)
        .plot(currentShapeProps.current.x1, currentShapeProps.current.y1, currentShapeProps.current.x2, currentShapeProps.current.y2)
        .stroke({ width: 1, color: "black" });

    } else if (currentAction === ActionType.FREE_HAND) {

      freeHandPoints.push({ x: e.offsetX, y: e.offsetY });

      (selectedElement.current as Path)
        .plot(`M${currentShapeProps.current.x1} ${currentShapeProps.current.y1} ${freeHandPoints.map((point) => `L${point.x} ${point.y} M${point.x} ${point.y} `).join(" ")} Z`);

    }

  }, [currentAction, freeHandPoints]);

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

  return (
    <SelectActionContext.Provider value={currentAction}>
      <Container maxW={"full"} p={0}>
        <Flex h="12" bg="blackAlpha.800" alignItems={"center"}>
          <Heading color={"white"} as={"h1"} size={"md"} ml={12} mr={6}>
            Svg Editor
          </Heading>
          <Box fontSize={13}>
            <EditorMenu menuTitle="Ficheiro" menuItems={[
              { title: "Exportar como SVG", onClick: () => { } },
              { title: "Exportar como Imagem", onClick: () => { } },
            ]} />
            <EditorMenu menuTitle="Editar" menuItems={[
              {
                title: "Desfazer", onClick: () => {
                  let shape = svgElements.pop();
                  if (shape) {
                    setSvgElements(svgElements);
                    setHistory([...history, shape!])
                    shape?.remove();
                  }
                }
              },
              {
                title: "Refazer", onClick: () => {
                  let shape = history.pop();
                  if (shape) {
                    setHistory(history);
                    setSvgElements([...svgElements, shape!])
                    svg?.add(shape!);
                  }
                }
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
          <Flex w="12" bg="blackAlpha.800" flexDir="column">
            <SelectActionButton title="Transformar" actionType={ActionType.TRANSFORM} onClick={updateActiveAction}>
              <FontAwesomeIcon icon={faArrowPointer} fontSize="18" color="white" />
            </SelectActionButton>
            <SelectActionButton title="Editar" actionType={ActionType.EDIT} onClick={updateActiveAction}>
              <FontAwesomeIcon icon={faHandPointer} fontSize="18" color="white" />
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
          <Flex w="12" bg="blackAlpha.800" flexDir="column">
            <SelectActionButton title="Definições do preenchimento" actionType={ActionType.FILL_COLOR} onClick={updateActiveAction}>
              <FontAwesomeIcon icon={faPalette} fontSize="18" color="white" />
            </SelectActionButton>
            <SelectActionButton title="Definições das bordas" actionType={ActionType.STROKE_COLOR} onClick={updateActiveAction}>
              <FontAwesomeIcon icon={faWorm} fontSize="18" color="white" />
            </SelectActionButton>
          </Flex>
        </Flex>
        <Flex justifyContent={"center"} alignItems={"center"} textAlign={"center"} h={"12"} bg={"blackAlpha.800"}>
          <Box color={"white"} fontSize={"sm"}>
            &copy; {new Date().getFullYear()} Svg Editor | All rights reserved
          </Box>
        </Flex>
      </Container>
    </SelectActionContext.Provider>
  )
};

export default SvgEditor;