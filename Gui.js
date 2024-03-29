"use strict";
var Gui = (function () {
    function Gui(engine) {
        this.engine = engine;
        this.intervalId = 0;
        this.engineStatus = IncrementumLudusStatus.NOT_YET_STARTED;
        this.engine = engine;
    }
    Gui.prototype.displayLevel = function () {
        var level = this.engine.player.getResourceInStorage("level");
        var h = "<strong>Level</strong>: ";
        if (level != null) {
            var q = level.getQuantity();
            var res = level.getResource();
            if ('getStepName' in res) {
                var getStepName = res['getStepName'];
                h += q + " " + getStepName.call(res, q);
            }
        }
        return h;
    };
    Gui.prototype.displayStorage = function () {
        var _this = this;
        var h = '<table border="1">';
        h += "<tr><th>Sac à pin's</th></tr>";
        h += "<tr><td>";
        if (this.engine.player.getStorage().length <= 1) {
            h += "no resource";
        }
        else {
            this.engine.player.getStorage().forEach(function (res) {
                if (!(res.getResource() instanceof Level)) {
                    h += _this.displayQuantity(res);
                }
            });
        }
        h += "</td></tr>";
        h += "</table>";
        return h;
    };
    Gui.prototype.displayFal = function (title, category) {
        var content = this.displayStorageCategoryContent(category);
        if (content != "") {
            return '<div id="fal">' + content + '</div>';
        }
        return "";
    };
    Gui.prototype.displayStorageCategory = function (title, category) {
        var content = this.displayStorageCategoryContent(category);
        if (content != "") {
            return this.displayStorageBox(title, content);
        }
        return "";
    };
    Gui.prototype.displayStorageBox = function (title, content) {
        var h = '<table border="1">';
        h += "<tr><th>" + title + "</th></tr>";
        h += "<tr><td>";
        h += content;
        h += "</td></tr>";
        h += "</table>";
        return h;
    };
    Gui.prototype.displayStorageCategoryContent = function (category) {
        var _this = this;
        return this.engine.player.getStorage()
            .filter(function (resQ) {
            var resource = resQ.getResource();
            return ('category' in resource) && (resource['category'] == category);
        })
            .map(function (res) { return _this.displayQuantity(res); }).join("");
    };
    Gui.prototype.displayProducers = function () {
        var _this = this;
        var h = '<table border="1">';
        h += '<tr><th>Production</th><th>Resource</th></tr>';
        this.engine.producers.forEach(function (producer) {
            if (producer.isAuto()) {
                var i = producer.getInterval();
                var interval = 0;
                if (i != null) {
                    interval = i;
                }
                h += '<tr>'
                    + '<td>' + producer.getName() + ' ' + _this.displayProgress(producer.getStartTime(), interval) + '</td>'
                    + '<td>' + _this.displayQuantities(producer.getResourcesQuantity()) + '</td>'
                    + '</tr>';
            }
            else {
                h += '<tr>'
                    + '<td><button onclick="engine.collectProducer(\'' + producer.getName() + '\');">' + producer.getName() + '</button></td>'
                    + '<td>' + _this.displayQuantities(producer.getResourcesQuantity()) + '</td>'
                    + '</tr>';
            }
        });
        h += '</table>';
        return h;
    };
    Gui.prototype.displayCrafters = function () {
        var _this = this;
        var h = '<table border="1">';
        h += "<tr>";
        h += "<th>Faire</th>";
        if (!this.getSimple()) {
            h += "<th>Va donner</th>";
        }
        h += "<th>Coût</th>";
        h += "</tr>";
        this.engine.crafters.forEach(function (trigger) { return h += _this.displayCrafter(trigger); });
        h += "</table>";
        return h;
    };
    Gui.prototype.displayCrafter = function (crafter) {
        var h = '<tr>';
        h += '<td>' + this.displayCraftButton(crafter) + '</td>';
        if (!this.getSimple()) {
            h += '<td>' + this.displayQuantities(crafter.getCraftedResources()) + '</td>';
        }
        h += '<td>' + this.displayAvailableQuantities(crafter.getCost()) + '</td>';
        h += '</tr>';
        return h;
    };
    Gui.prototype.displayCraftButton = function (crafter) {
        var h = '';
        if (crafter.isAuto()) {
            h = '<div'
                + (!this.engine.player.hasResources(crafter.getCost()) ? ' title="Pas assez de ressources"' : '') + '>'
                + this.displayAutoCraft(crafter) + crafter.getName() + ' (' + this.displayTime(crafter.getDuration()) + ')'
                + ' ' + this.displayProgress(crafter.getStartTime(), crafter.getDuration())
                + '</div>';
        }
        else {
            h = '<button onclick="engine.startCrafting(\'' + crafter.getName() + '\');"'
                + (!this.engine.player.hasResources(crafter.getCost()) ? ' disabled="disabled" title="Pas assez de ressources"' : '')
                + ((crafter.isCrafting()) ? ' disabled="disabled" title="En cours..."' : '') + '>'
                + this.displayAutoCraft(crafter) + crafter.getName() + ' (' + this.displayTime(crafter.getDuration()) + ')'
                + ' ' + this.displayProgress(crafter.getStartTime(), crafter.getDuration())
                + '</button>';
        }
        return h;
    };
    Gui.prototype.displayAutoCraft = function (crafter) {
        if (crafter.isAutomatable()) {
            return '<input type="checkbox" '
                + 'onclick="engine.switchAutoCrafting(\'' + crafter.getName() + '\');" '
                + 'title="Auto" '
                + (crafter.isAuto() ? ' checked="checked"' : '') + ' />';
        }
        return '';
    };
    Gui.prototype.displayTree = function () {
        var h = '<table border="1">';
        h += "<tr>";
        h += "<th>Objectifs</th>";
        h += "<th>Atteindre</th>";
        if (!this.getSimple()) {
            h += "<th>Débloque</th>";
        }
        h += "</tr>";
        if (this.engine.triggers.length <= 0) {
            h += '<tr><td colspan="3"><b>Vous avez gagné!</b> Fini! (pour le moment, en attendant la prochaine évolution du jeux)</td></tr>';
        }
        else {
            h += this.displayBranch(engine.triggers);
        }
        h += "</table>";
        return h;
    };
    Gui.prototype.displayBranch = function (triggers) {
        var _this = this;
        var h = '';
        triggers.forEach(function (trig) {
            h += "<tr>";
            if (trig.getChangeEngineStatus() == IncrementumLudusStatus.WIN) {
                h += '<td>[<span class="win" title="Atteindre cet objectif et c\'est gagné.">Gagné</span>] ' + trig.getName() + "</td>";
            }
            else if (trig.getChangeEngineStatus() == IncrementumLudusStatus.LOOSE) {
                h += '<td>[<span class="loose" title="Perdu, si cet objectif est atteint.">Perdu</span>] ' + trig.getName() + "</td>";
            }
            else {
                h += '<td>' + trig.getName() + "</td>";
            }
            h += "<td>" + _this.displayAvailableQuantities(trig.getResourcesTrigger()) + "</td>";
            if (!_this.getSimple()) {
                h += "<td>" + ((trig.getSpawnProducers().length) ? ' <b>Production</b>:' + trig.getSpawnProducers().map(function (p) { return p.getName(); }).join(', ') : '')
                    + ((trig.getSpawnCrafters().length) ? ' <b>Objectif</b>:' + trig.getSpawnCrafters().map(function (p) { return p.getName(); }).join(', ') : '')
                    + ((trig.getSpawnResources().length) ? ' <b>Ressources</b>:' + _this.displayQuantities(trig.getSpawnResources()) : '') + "</td>";
            }
            h += "</tr>";
        });
        return h;
    };
    Gui.prototype.displayQuantities = function (quantities) {
        var _this = this;
        return quantities.map(function (resQ) { return _this.displayQuantity(resQ); })
            .join(' ');
    };
    Gui.prototype.displayAvailableQuantities = function (quantities) {
        var _this = this;
        var h = '';
        quantities.forEach(function (resQ) {
            var storageRes = _this.engine.player.getResourceInStorage(resQ.getResource().getName());
            var cssClass = 'notAvailableResource';
            if (storageRes != null && storageRes.getQuantity() >= resQ.getQuantity()) {
                cssClass = 'availableResource';
            }
            h += _this.displayQuantity(resQ, cssClass, storageRes);
        });
        h += '';
        return h;
    };
    Gui.prototype.displayQuantity = function (quantity, optionnalCss, storageRes) {
        if (optionnalCss === void 0) { optionnalCss = ''; }
        if (storageRes === void 0) { storageRes = null; }
        var res = quantity.getResource();
        var image = '';
        if ('image' in res) {
            image = res.image;
        }
        var details = null;
        if ('getDetails' in quantity) {
            details = quantity['getDetails'];
        }
        return '<div class="resource ' + quantity.getResource().$type + ' ' + optionnalCss + '">'
            + '<div class="resource_label">'
            + ((storageRes != null) ? '<span>' + storageRes.show() + '</span>/' : '')
            + quantity.show()
            + '</div>'
            + ((image == '') ? quantity.getResource().getName() : '<img src="images/' + image + '" title="' + quantity.getResource().getName() + '" alt="' + quantity.getResource().getName() + '" class="resource_img">')
            + ((details != null) ? details.call(quantity) : '')
            + '</div>';
    };
    Gui.prototype.displayTime = function (miliSeconds) {
        if (miliSeconds == null) {
            return '';
        }
        var time = '';
        if (miliSeconds >= 60000) {
            time += Math.round(miliSeconds / 60000) + 'min';
            miliSeconds = miliSeconds % 60000;
        }
        if (miliSeconds < 500 && time != "") {
            return time;
        }
        time += Math.round(miliSeconds / 1000) + 's';
        return time;
    };
    Gui.prototype.displayProgress = function (startTime, duration) {
        var progress = this.calculateProgress(startTime);
        return this.formatProgress(progress / duration, this.displayTime(duration - progress));
    };
    Gui.prototype.calculateProgress = function (startTime) {
        if (startTime == null) {
            return 0;
        }
        return (new Date().getTime() - startTime.getTime());
    };
    Gui.prototype.formatProgress = function (percent01, text) {
        var percent100 = Math.round(percent01 * 100);
        return '<progress value="' + percent100 + '" max="100">' + text + '</progress>';
    };
    Gui.prototype.displayDoc = function () {
        var h = '<table border="1">';
        h += "<tr><th></th><th>Nom</th><th>Catégorie</th><th>Desciption</th></tr>";
        resourceList.forEach(function (res) {
            h += "<tr>";
            h += "<td>";
            h += '<img src="images/' + res.image + '" title="' + res.getName() + '" alt="' + res.getName() + '" class="resource_img">';
            h += "</td>";
            h += "<td>";
            h += res.getName();
            h += "</td>";
            h += "<td>";
            h += res.category;
            h += "</td>";
            h += "<td>";
            h += res.description;
            h += "</td>";
            h += "</tr>";
        });
        h += "</table>";
        return h;
    };
    Gui.prototype.getSimple = function () {
        var checkbox = document.getElementById('simple');
        if (checkbox != null && ('checked' in checkbox) && checkbox['checked']) {
            return true;
        }
        return false;
    };
    Gui.prototype.loose = function () {
        if (this.engine.status == IncrementumLudusStatus.LOOSE
            && this.engineStatus != IncrementumLudusStatus.LOOSE) {
            this.endGame(false, "Tu as trop vomis c'est pas bien!! Tu aura plus de chance le(a) prochain(e) foie(s).");
            this.engineStatus = this.engine.status;
        }
        if (this.engine.status == IncrementumLudusStatus.WIN
            && this.engineStatus != IncrementumLudusStatus.WIN) {
            this.endGame(true, "C'est bien, tu as gagné ! Mais guette les prochaines évolutions du jeu.");
            this.engineStatus = this.engine.status;
        }
    };
    Gui.prototype.endGame = function (win, raison) {
        var raisonDiv = document.getElementById('raison');
        if (raisonDiv != null) {
            raisonDiv.innerHTML = raison;
        }
        var overlayTitle = document.getElementById('overlayTitle');
        if (overlayTitle != null) {
            if (win) {
                overlayTitle.innerText = "Et c'est gagné!";
                overlayTitle.className = 'win';
            }
            else {
                overlayTitle.innerText = "Perdu!";
                overlayTitle.className = 'loose';
            }
        }
        var overlay = document.getElementById('overlay');
        if (overlay != null) {
            var o_1 = overlay;
            o_1.className = 'show';
            window.setTimeout(function () { o_1.className += ' shade'; }, 500);
        }
    };
    Gui.youWin = function (raison) {
        var raisonDiv = document.getElementById('raison');
        if (raisonDiv != null) {
            raisonDiv.innerHTML = raison;
        }
        var overlay = document.getElementById('overlay');
        if (overlay != null) {
            var o_2 = overlay;
            o_2.className = 'show';
            window.setTimeout(function () { o_2.className += ' shade'; }, 500);
        }
    };
    Gui.prototype.stop = function () {
        window.clearInterval(this.intervalId);
        engine.stop();
    };
    Gui.eraseStorage = function () {
        window.localStorage.removeItem('Fal');
        window.localStorage.removeItem('FalVersion');
        console.log('eraseStorage');
    };
    Gui.prototype.clearStorage = function () {
        Gui.eraseStorage();
    };
    Gui.prototype.restart = function () {
        if (window.confirm('Ça va redémarrer le jeu depuis zéro. sûre?')) {
            Gui.eraseStorage();
            window.location.reload();
            Gui.eraseStorage();
            this.stop();
            Gui.eraseStorage();
        }
    };
    Gui.prototype.fastMode = function () {
        engine.fastMode = 1000;
    };
    Gui.prototype.updateGui = function () {
        NodeUpdate.updateDiv('level', this.displayLevel());
        NodeUpdate.updateDiv('storageGlobal', this.displayStorageCategory("Info", "global"));
        NodeUpdate.updateDiv('storageFal', this.displayFal("fal", "insigne"));
        NodeUpdate.updateDiv('storageEmbleme', this.displayStorageCategory("Emblèmes de filières", "emblème"));
        NodeUpdate.updateDiv('storageVilles', this.displayStorageCategory("Pin's de villes", "ville"));
        NodeUpdate.updateDiv('producers', this.displayProducers());
        NodeUpdate.updateDiv('crafters', this.displayCrafters());
        NodeUpdate.updateDiv('tree', this.displayTree());
        NodeUpdate.updateDiv('doc', this.displayDoc());
        this.loose();
    };
    Gui.prototype.start = function (refreshInterval) {
        var _this = this;
        this.intervalId = window.setInterval(function () { return _this.updateGui(); }, refreshInterval);
    };
    return Gui;
}());
var KonamiCode = (function () {
    function KonamiCode(onKonamiCode) {
        this.keyIndex = 0;
        this.onKonamiCodeFunction = onKonamiCode;
        var body = document.getElementsByTagName('body')[0];
        body.onkeydown = this.onKeydown.bind(this);
    }
    KonamiCode.prototype.onKeydown = function (e) {
        if (e.keyCode == KonamiCode.keyCodeList[this.keyIndex]) {
            if (this.keyIndex == (KonamiCode.keyCodeList.length - 1)) {
                this.onKonamiCodeFunction();
                this.keyIndex = 0;
            }
            else {
                this.keyIndex++;
            }
        }
        else {
            this.keyIndex = 0;
        }
    };
    KonamiCode.keyCodeList = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
    return KonamiCode;
}());
//# sourceMappingURL=Gui.js.map