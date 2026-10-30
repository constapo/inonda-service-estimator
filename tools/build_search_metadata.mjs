// Reuse the existing approved translations for server-rendered search previews.
import {writeFileSync} from 'node:fs';
import {translationDictionary} from '../dist/i18n.mjs';
const title = 'Service Estimator · INONDA LTD';
const description = 'Explore your property plan with INONDA LTD. Build your own estimate in Cyprus, with 19% VAT included, then call to arrange an inspection and written offer.';
const locales = {el:'el_CY',en:'en_CY',ru:'ru_RU',uk:'uk_UA',he:'he_IL',ro:'ro_RO'};
const metadata = Object.fromEntries(Object.entries(locales).map(([lang,locale]) => {
  const dictionary = translationDictionary(lang);
  return [lang, {title:dictionary[title] || title, description:dictionary[description] || description, locale}];
}));
writeFileSync(new URL('../dist/search-metadata.json',import.meta.url),JSON.stringify(metadata,null,2)+'\n');
