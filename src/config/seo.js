export function metaForRoute(route) {
  switch (route) {
    case "/": return { title: "Doggerz — Adopt your pixel pup", description: "No grind. Just vibes." };
    default:  return { title: "Doggerz", description: "Virtual pup sim." };
  }
}
