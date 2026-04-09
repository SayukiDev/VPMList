/**
 * Build a `vcc://` URL that the VRChat Creator Companion uses to register
 * a new package listing. See https://vcc.docs.vrchat.com/vpm/repos
 */
export function addRepoUrl(listingUrl: string): string {
  return `vcc://vpm/addRepo?url=${encodeURIComponent(listingUrl)}`;
}
