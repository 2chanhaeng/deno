// IPv6 ranges in --allow-net grant every address they contain and nothing
// else.
for (
  const host of ["[::1]:8000", "[fd12:3456::1]:8000", "[fc00::1]:8000", "[::2]"]
) {
  const { state } = await Deno.permissions.query({ name: "net", host });
  console.log(`${host} ${state}`);
}
