<style>
	div.js-callout-mainElement {box-sizing: content-box;}
	.js-callout-beakLeft, .js-callout-beakRight, .js-callout-beakTop, .js-callout-beakBottom {
		background-color: aliceblue;
	}

	.js-callout-content {
		background-color: aliceblue;
		width: 500px !important;
	}
	
	ul.attachments, ul.attachments li {position:relative;padding:0;margin:0;list-style:none; }
	ul.attachments li {padding-left:30px;margin:15px 0;}

	ul.attachments li a::before {
		position:absolute;
		width:25px;
		height:27px;
		display:;
		left: 0px;
		top:0;
		overflow:hidden;
	}	
	ul.attachments li a[href$='.pdf']::before {
		content: url('/SiteAssets/Branding/icons/filetypes/pdf.png');
	}	
	ul.attachments li a[href$='.docx']::before, ul.attachments li a[href$='.doc']::before {
		content: url('/SiteAssets/Branding/icons/filetypes/docx.png');
	}	
	ul.attachments li a[href$='.pdf']::before {
		content: url('/SiteAssets/Branding/icons/filetypes/pdf.png');
	}
	.callout-section > div >span {
		width:180px;
		font-weight:bold;
		display:inline-block;
	}
</style>

<script type="text/javascript">
	var launchPointTd;
	var calloutBody = "";
	var title = "";
	var seqNo = "";
	var itemId = "";
	var attachmentFiles;
	var listItem;
	
	function AttachHoverEvent()
	{
		console.log($("#WebPartWPQ2 table[summary='Memos']  > tbody > tr").length );
		$("#WebPartWPQ2").on("mouseover", "table[summary='Memos']  > tbody > tr td:nth-child(3)", function (e) {
			seqNo = $(this).parent().find("td:nth-last-child(4)").text();
			title = $(this).find("div a").text();
			itemId = $(this).parent().attr("id").split(",")[1];
			launchPointTd = this;
			
			// get the callout
			var callout = CalloutManager.getFromLaunchPointIfExists(this);
			if (callout == null)
			{
				retrieveListItem(itemId);
				
				$(this).hover();
			}
			
			
			console.log("on mouse over triggered. with or withnot callout.");
			
		});	
	}
	
	function retrieveListItem(itemId) {
		var ctx = new SP.ClientContext.get_current();
		var web = ctx.get_web();
		var list = web.get_lists().getByTitle('Memos');
		listItem = list.getItemById(itemId);  

		var attachmentFolder = web.getFolderByServerRelativeUrl('Lists/Memos/Attachments/'+itemId);
		attachmentFiles= attachmentFolder.get_files();
		ctx.load(listItem);
		ctx.load(attachmentFiles);
		
		ctx.executeQueryAsync(Function.createDelegate(this,this.onAttachmentSuccess),Function.createDelegate(this,this.onAttachmentFailed));
	}
	
    function onAttachmentSuccess(sender, args) {
		calloutBody = "<div class=\"ms-soften\" style=\"margin-top:13px;\">" 
					+ "<hr/></div>" 
					+ "<div class=\"callout-section\" style=\"margin-top:13px;\">"; 
					
		calloutBody += "<div  class=\"Department\"><span>Department:</span>" + listItem.get_item("Department").get_lookupValue() + "</div>";
		calloutBody += "<div  class=\"SequentialNumber\"><span>Sequential Number:</span>" + listItem.get_item("SequentialNumber") + "</div>";
		calloutBody += "<div  class=\"MemoDate\"><span>Memo Date:</span>" + listItem.get_item("MemoDate").format('MMM dd yyyy'); + "</div>";
		
		calloutBody += "<ul class=\"attachments\">";
		for(var i=0; i<attachmentFiles.get_count(); i++)
		{
			var fileName = attachmentFiles.itemAt(i).get_name();
			var fileurl = attachmentFiles.itemAt(i).get_serverRelativeUrl();
			calloutBody += "<li><a href='" + fileurl + "'>" + fileName + "</a></li>";
		}
		calloutBody += "</ul>";

		calloutBody += "</div>";
		
		var callout = CalloutManager.getFromLaunchPointIfExists(launchPointTd);
		if (callout == null)
		{
			var listCallout = CalloutManager.createNew({ 
						 launchPoint: launchPointTd,
						 beakOrientation: "leftRight", 
						 ID: "callout_" + seqNo, 
						 title: title, 
						 openOptions: {event: 'hover'},
						 content: calloutBody 
				 }); 
				 
			 $(launchPointTd).trigger("mouseover");
		}
		
    }	
	
	function onAttachmentFailed(sender, args) {
		console.log('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
    }
	
	$(document).ready(function(){
		SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function(){
			SP.SOD.executeFunc("callout.js", "Callout", AttachHoverEvent);
		});
	});
</script>