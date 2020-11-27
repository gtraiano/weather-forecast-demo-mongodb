/* 
   Returns supported locales
   New languages/locales must be added manually (make sure the locale has a corresponding
   json file in ./translations/)
*/

var supported = [{'language':'English', 'locale':'en'}, {'language':'Ελληνικά', 'locale':'el'}];
export default function supportedLocales() {
	return supported;
}