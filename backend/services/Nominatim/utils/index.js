/* params = [{ name: parameter name, value: parameter value }] */
export const prepareQuery = (baseUrl, endpoint, params) => {
	let query = `${baseUrl}${endpoint}`;
	params.forEach((param, index) => {
		query = query.concat(`${index === 0 ? '?' : '&'}${param.name}=${param.value}`);
	})

	return query;
}