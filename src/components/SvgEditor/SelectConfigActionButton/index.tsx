import { Flex } from "@chakra-ui/react";
import { SelectConfigActionContext } from "../../../context";
import { ShapeConfigActionType } from "../../../enums";

interface SelectConfigActionButtonProps {
  children: React.ReactNode;
  title?: string;
  configActionType: ShapeConfigActionType;
  onClick?: (configActionType: ShapeConfigActionType) => void;
}

export const SelectConfigActionButton: React.FC<SelectConfigActionButtonProps> = ({ children, title, configActionType, onClick }) => {
  return (
    <SelectConfigActionContext.Consumer>
      {currentAction => (
        <Flex paddingY={4} justifyContent={"center"} borderTop={"1px"} borderColor={"whiteAlpha.200"}
          cursor={"pointer"} bg={currentAction === configActionType ? "whiteAlpha.400" : "none"} title={title}
          onClick={() => onClick && onClick(configActionType)}
          _hover={{
            bg: "whiteAlpha.200"
          }}>
          {children}
        </Flex>
      )}
    </SelectConfigActionContext.Consumer>
  );
}