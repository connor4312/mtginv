import { FC } from "react";
import { Form } from "remix";

export const LogoutButton: FC = () => (
  <Form method="post" action="/logout">
    <button type="submit">Log Out</button>
  </Form>
);
