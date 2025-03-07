var projectLookup = OO.ui.infuse($('#project')),
	pageLookup = OO.ui.infuse($('#page'), {
		domain: projectLookup.getDomain()
	}),
	namespacesInput = OO.ui.infuse($('#namespaces')),
	button = OO.ui.infuse($('#submit')),
	namespacesSelect = new NamespaceLookupWidget({
		value: namespacesInput.getValue() && namespacesInput.getValue().split(','),
		domain: projectLookup.getDomain()
	}),
	progressWidget = new OO.ui.ProgressBarWidget(),
	progressLayout = new OO.ui.FieldLayout(progressWidget, {
		align: 'top'
	}),
	out = $('#out'),
	request = undefined;

function submitForm(pushState) {
	var params = {
			project: projectLookup.getValue(),
			page: pageLookup.getValue(),
			namespaces: namespacesSelect.getValue().join(',')
		},
		query = Object.keys(params).map(param => {
			return param + '=' + params[param];
		}).join('&');

	if (pushState) {
		history.pushState(params, null, (query ? '?' : '') + query);
	}

	if (!query) {
		out.empty();
		return;
	}

	if (request) {
		request.wasReplaced = true;
		request.abort();
	}

	out.html(progressLayout.$element);

	request = $.get('output/?' + query);

	request.then(function(res) {
		out.html(res);
	}, function(req) {
		if (req.wasReplaced) return;

		out.html('<div class="error">Failed to send API request.</div>');
	});
}

projectLookup.on('domain', function (domain) {
	pageLookup.setDomain(domain);
	namespacesSelect.setDomain(domain);
});

button.on('click', function() {
	submitForm(true);
});

window.addEventListener('popstate', function(e) {
	if (!e.state) return;

	projectLookup.setValue(e.state.project);
	pageLookup.setValue(e.state.page);
	namespacesSelect.setValue(e.state.namespaces.split(','));

	submitForm(false);
});

namespacesInput.$element.replaceWith(namespacesSelect.$element);
