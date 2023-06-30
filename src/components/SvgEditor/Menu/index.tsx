import { Flex, Kbd, Menu, MenuButton, MenuItem, MenuList, Text } from "@chakra-ui/react";
import { faChevronDown, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface EditorMenuProps {
  menuTitle: string;
  menuItems: EditorMenuItemProps[];
}

interface EditorMenuItemProps {
  title: string;
  shortcut?: string;
  onClick: () => void;
}

export const EditorMenu: React.FC<EditorMenuProps> = ({ menuTitle, menuItems }) => {
  return (
    <Menu>
      <MenuButton color={"white"} cursor={"pointer"}
        _hover={{
          color: "whiteAlpha.800"
        }}
        borderRadius={"sm"}
        p={2}
        _expanded={{ bg: "whiteAlpha.200" }}
        _focus={{ boxShadow: 'outline' }}>
        {menuTitle} <FontAwesomeIcon icon={faChevronDown} fontSize={10} />
      </MenuButton>
      <MenuList>
        {menuItems.map((item, index) =>
          <MenuItem key={index} onClick={item.onClick}>
            <Text mr={2} minW={40}>
              {item.title}
            </Text>
            {item.shortcut && <Flex justifyContent={"right"} w={"full"} textAlign={"right"} alignItems={"center"}>
              {
                item.shortcut?.split(" ").map((key, index) => index % 2 === 0 ? <Kbd m={0} key={index} mx={0.5}>{key}</Kbd> : <FontAwesomeIcon key={index} icon={faPlus} fontSize={10} />)
              }
            </Flex>}
          </MenuItem>)}
      </MenuList>
    </Menu>
  );
}