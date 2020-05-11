/**
 * Navigation is a reusable component
 * responsible for rendering the menu.
 */
import * as React from "react";
import { Link } from "react-router-dom";
import { Menu } from "semantic-ui-react";

export const Navigation: React.FC = _props => {
  return (
    <nav>
      <Menu vertical compact borderless>
        <Menu.Item>
          <Menu.Header>Math Operations</Menu.Header>
          <Menu.Menu>
            <Menu.Item as={Link} to="/findMedian">FindMedian</Menu.Item>
          </Menu.Menu>
        </Menu.Item>
      </Menu>
    </nav>
  );
};
