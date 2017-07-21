/*
    Denis Molodtsov 2017
    Displays attachments callouts for list items

    Deployment steps: 
    1) reference JSLink ~site/_catalogs/masterpage/attachments/callouts.js
    2) reference css file /_catalogs/masterpage/attachments/callouts.css
*/

SP.SOD.executeFunc("clienttemplates.js", "SPClientTemplates", function () {

    function getBaseHtml(ctx) {
        return SPClientTemplates["_defaultTemplates"].Fields.default.all.all[ctx.CurrentFieldSchema.FieldType][ctx.BaseViewID](ctx);
    }

    function init() {

        SPClientTemplates.TemplateManager.RegisterTemplateOverrides({

            OnPreRender: function (ctx) {
                $(function () {
                    SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function () {
                        SP.SOD.executeFunc("callout.js", "Callout", AttachHoverEvent);
                    });
                })

                var launchPointTd;
                var calloutBody = "";
                var title = "";
                var seqNo = "";
                var itemId = "";
                var attachmentFiles;
                var listItem;

                function AttachHoverEvent() {
                    $("#WebPartWPQ2 table[summary='Memos']  > tbody > tr td:nth-child(3)").each(function () {

                        seqNo = $(this).parent().find("td:nth-last-child(4)").text();
                        title = $(this).find("div a").text();
                        itemId = $(this).parent().attr("id").split(",")[1];
                        launchPointTd = this;

                        // get the callout
                        var callout = CalloutManager.getFromLaunchPointIfExists(this);
                        if (callout == null) {
                            retrieveListItem(itemId, launchPointTd);
                        }
                    })
                }

                function retrieveListItem(itemId, launchPointTd) {
                    var ctx = new SP.ClientContext.get_current();
                    var web = ctx.get_web();
                    var list = web.get_lists().getByTitle('Memos');
                    listItem = list.getItemById(itemId);

                    var attachmentFolder = web.getFolderByServerRelativeUrl('Lists/Memos/Attachments/' + itemId);
                    attachmentFiles = attachmentFolder.get_files();
                    ctx.load(listItem);
                    ctx.load(attachmentFiles);
                    var params = {
                        listItem: listItem,
                        attachmentFiles: attachmentFiles,
                        launchPointTd: launchPointTd
                    }
                    ctx.executeQueryAsync(

                        Function.createDelegate(this, function () { success(params); }),

                        function (sender, args) {
                            console.log('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
                        });

                    function success(params, args, param) {
                        calloutBody = "<div class=\"ms-soften\" style=\"margin-top:13px;\">"
					    + "<hr/></div>"
					    + "<div class=\"callout-section\" style=\"margin-top:13px;\">";
                        calloutBody += "<div  class=\"SequentialNumber\">" + params.listItem.get_item("SequentialNumber") + "</div>";

                        calloutBody += "<div  class=\"Department\"><span>Department:</span>" + params.listItem.get_item("Department").get_lookupValue() + "</div>";
                        calloutBody += "<div  class=\"SequentialNumber\"><span>Sequential Number:</span>" + params.listItem.get_item("SequentialNumber") + "</div>";
                        calloutBody += "<div  class=\"MemoDate\"><span>Memo Date:</span>" + params.listItem.get_item("MemoDate").format('MMM dd yyyy'); + "</div>";

                        calloutBody += "<ul class=\"attachments\">";

                        for (var i = 0; i < params.attachmentFiles.get_count(); i++) {
                            var fileName = params.attachmentFiles.itemAt(i).get_name();
                            var fileurl = params.attachmentFiles.itemAt(i).get_serverRelativeUrl();
                            calloutBody += "<li><a href='" + fileurl + "'>" + fileName + "</a></li>";
                        }
                        calloutBody += "</ul>";
                        calloutBody += "</div>";

                        var callout = CalloutManager.getFromLaunchPointIfExists(params.launchPointTd);
                        if (callout == null) {
                            var listCallout = CalloutManager.createNew({
                                launchPoint: params.launchPointTd,
                                beakOrientation: "leftRight",
                                ID: "callout_" + seqNo,
                                title: title,
                                openOptions: { event: 'hover' },
                                content: calloutBody
                            });

                        }
                    }
                }

            },
            OnPostRender: function (ctx) {




            },

            //ListTemplateType: 100

        });



    }

    RegisterModuleInit(SPClientTemplates.Utility.ReplaceUrlTokens("~site/_catalogs/masterpage/attachments/callouts.js"), init);
    init();

});
