export const fixedOrigin = (hosts: string[]) => {
  const isPortPresent = /(https?:\/\/.*):(\d*)\/?(.*)/g;
  return hosts.map((host: string) => {
    // eslint-disable-next-line no-eq-null, eqeqeq
    if (host.includes('https:') && host.match(isPortPresent) == null) {
      return [...host, ':443'];
    }

    // eslint-disable-next-line no-eq-null, eqeqeq
    if (host.includes('http:') && host.match(isPortPresent) == null) {
      return [...host, ':80'];
    }

    return host;
  });
};