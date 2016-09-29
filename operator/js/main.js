(function () {
    function catchJSON(rawInput) {
        var toFormat;

        if (typeof rawInput == 'string') {
            toFormat = JSON.parse(rawInput);
        } else {
            toFormat = rawInput;
        }

        function sendJSON(rawJSON) {
            var newJSON = [];

            var userNames = [];
            var users = [];

            // Creates the userNames array
            // Structure: ["name1", "name2", ... ]
            for (var i in rawJSON) {
                if (rawJSON[i].assigneeId !== undefined) {
                    userNames.push(rawJSON[i].assigneeId);
                }
            }

            // Makes every name unique
            var userNamesUnique = userNames.filter(function(elem, index, self) {
                return index == self.indexOf(elem);
            })

            // Creates the users array
            // Structure: [{ name: "name1" }, { name: "name2" }, ... ]
            for (let i in userNamesUnique) {
                users[i] = {};
                users[i].name = userNamesUnique[i];
                users[i].children = [];
            }

            var finalUsers = {};

            // List to object
            for (let user of users) {
                finalUsers[user.name] = user;
            }

            // Creates the final Structure
            for (let i in rawJSON) {
                if (rawJSON[i].assigneeId !== undefined) {
                    finalUsers[rawJSON[i].assigneeId].children.push(getChild(rawJSON[i]));
                }
            }

            return finalUsers;

            // Returns a filtered object
            function getChild(full) {
                var filtered = {
                    key: full.key,
                    title: full.title,
                    labels: full.labels,
                    link: full.link,
                    radio: -1
                };

                return filtered;
            }
        };

        // Sends formated json
        MashupPlatform.wiring.pushEvent("outputJSON", sendJSON(toFormat));
    };

    // Receives the JSON
    MashupPlatform.wiring.registerCallback("inputJSON", catchJSON);
})();
