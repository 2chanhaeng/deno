// IPv6 ranges in --deny-net, written bare (fc00::/7) or with brackets
// ([fe80::]/10, [2001:db8::]/32:8000), must deny every address they contain.
// The check happens before any socket is opened, so this does not depend on
// the machine having IPv6 routes.

async function connect(hostname: string, port: number) {
  try {
    const conn = await Deno.connect({ hostname, port });
    conn.close();
    console.log(`FAIL: connect [${hostname}]:${port} was not denied`);
  } catch (e) {
    if (e instanceof Deno.errors.NotCapable) {
      console.log(`PASS: connect [${hostname}]:${port} denied`);
    } else {
      console.log(`FAIL: connect [${hostname}]:${port} threw ${e}`);
    }
  }
}

async function fetchUrl(url: string) {
  try {
    await fetch(url);
    console.log(`FAIL: fetch ${url} was not denied`);
  } catch (e) {
    if (e instanceof Deno.errors.NotCapable) {
      console.log(`PASS: fetch ${url} denied`);
    } else {
      console.log(`FAIL: fetch ${url} threw ${e}`);
    }
  }
}

await connect("fc00::1", 8000);
await connect("fdab::1", 8000);
await connect("fe80::1", 8000);
await connect("2001:db8::1", 8000);
await fetchUrl("http://[fc00::1]:8000/");
await fetchUrl("http://[fe80::1]:8000/");

// Outside every denied range, or on a port the port-scoped range does not
// cover.
for (const host of ["[2001:db8::1]:80", "[2001:db9::1]:8000", "[::1]:8000"]) {
  const { state } = await Deno.permissions.query({ name: "net", host });
  console.log(`${host} ${state}`);
}
