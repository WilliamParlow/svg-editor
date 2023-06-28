import { Flex } from "@chakra-ui/react";
import { SelectActionContext } from "../../../context";
import { ActionType } from "../../../enums";

interface SelectActionButtonProps {
  children: React.ReactNode;
  title?: string;
  actionType: ActionType;
  onClick?: (actionType: ActionType) => void;
}

export const SelectActionButton: React.FC<SelectActionButtonProps> = ({ children, title, actionType, onClick }) => {
  return (
    <SelectActionContext.Consumer>
      {currentAction => (
        <Flex paddingY={4} justifyContent={"center"} borderTop={"1px"} borderColor={"whiteAlpha.200"}
          cursor={"pointer"} bg={currentAction === actionType ? "whiteAlpha.400" : "none"} title={title}
          onClick={() => onClick && onClick(actionType)}
          _hover={{
            bg: "whiteAlpha.200"
          }}>
          {children}
        </Flex>
      )}
    </SelectActionContext.Consumer>
  );
}