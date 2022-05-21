import { createCookieSessionStorage, redirect } from "remix";
import { Authenticator } from "remix-auth";
import { Auth0Strategy } from "remix-auth-auth0";
import invariant from "tiny-invariant";
import { findOrCreate } from "~/models/user.server";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 60,
    path: "/",
    sameSite: "strict",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

export interface ISessionUser {
  id: string;
  email: string;
}

export const getUser = (request: Request): Promise<ISessionUser | null> =>
  authenticator.isAuthenticated(request);

export const authenticator = new Authenticator<ISessionUser>(sessionStorage);

invariant(process.env.AUTH0_CALLBACK_URL, "AUTH0_CALLBACK_URL must be set");
invariant(process.env.AUTH0_CLIENT_ID, "AUTH0_CLIENT_ID must be set");
invariant(process.env.AUTH0_CLIENT_SECRET, "AUTH0_CLIENT_SECRET must be set");
invariant(process.env.AUTH0_DOMAIN, "AUTH0_DOMAIN must be set");

authenticator.use(
  new Auth0Strategy(
    {
      callbackURL: process.env.AUTH0_CALLBACK_URL,
      clientID: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      domain: process.env.AUTH0_DOMAIN,
    },
    async ({ profile }) => {
      // Get the user data from your DB or API using the tokens and profile
      const email = profile.emails[0].value;
      const user = await findOrCreate(email);
      console.log(user.id);
      return {
        email: user.email,
        id: user.id,
      };
    }
  )
);

// const USER_SESSION_KEY = "userId";

// export async function getSession(request: Request) {
//   const cookie = request.headers.get("Cookie");
//   return sessionStorage.getSession(cookie);
// }

// export async function getUserId(request: Request): Promise<string | undefined> {
//   const session = await getSession(request);
//   const userId = session.get(USER_SESSION_KEY);
//   return userId;
// }

// export async function getUser(request: Request): Promise<null | User> {
//   const userId = await getUserId(request);
//   if (userId === undefined) return null;

//   const user = await getUserById(userId);
//   if (user) return user;

//   throw await logout(request);
// }

export async function mustGetUser(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const user = await getUser(request);
  if (!user) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return user;
}

// export async function requireUser(request: Request) {
//   const userId = await requireUserId(request);

//   const user = await getUserById(userId);
//   if (user) return user;

//   throw await logout(request);
// }

// export async function createUserSession({
//   request,
//   userId,
//   remember,
//   redirectTo,
// }: {
//   request: Request;
//   userId: string;
//   remember: boolean;
//   redirectTo: string;
// }) {
//   const session = await getSession(request);
//   session.set(USER_SESSION_KEY, userId);
//   return redirect(redirectTo, {
//     headers: {
//       "Set-Cookie": await sessionStorage.commitSession(session, {
//         maxAge: remember
//           ? 60 * 60 * 24 * 7 // 7 days
//           : undefined,
//       }),
//     },
//   });
// }

// export async function logout(request: Request) {
//   const session = await getSession(request);
//   return redirect("/", {
//     headers: {
//       "Set-Cookie": await sessionStorage.destroySession(session),
//     },
//   });
// }
