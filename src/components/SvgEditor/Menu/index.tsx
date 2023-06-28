import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface EditorMenuProps {
  menuTitle: string;
  menuItems: EditorMenuItemProps[];
}

interface EditorMenuItemProps {
  title: string;
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
        {menuItems.map((item, index) => <MenuItem key={index} onClick={item.onClick}>{item.title}</MenuItem>)}
      </MenuList>
    </Menu>
  );
}