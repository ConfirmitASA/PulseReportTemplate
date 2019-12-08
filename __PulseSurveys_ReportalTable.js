public class PulseSurveys_ReportalTable implements IPulseSurveysInfo {

    private var _pulseSurveysTablePath : String; // "PulseSurveyData:VisibleSurveys" = "pageId:tableName"
    private var _isEmptyOptionNeeded: Boolean;
    private var _additionalInfo;

    /**
     * constructor
     * @param {Object} storageInfo - path to table that lists all existing pulse surveys (not filtered by userid)
     */
    private function PulseSurveys_ReportalTable(context, storageInfo) {
        _isEmptyOptionNeeded = storageInfo.isEmptyOptionNeeded;
        _pulseSurveysTablePath = storageInfo.tableName;
        _additionalInfo = storageInfo.hasOwnProperty('additionalInfo') ? storageInfo.additionalInfo: [];
    }

    /**
     * creates instance of PulseSurveys_ReportalTable class, should have check if instance is created already (singleton)
     */
    public static function getInstance(context, storageInfo){
        var log = context.log;
        return new PulseSurveys_ReportalTable(context, storageInfo);
    }

    /**
     * implements interface
     * @param {Object} context {state: state, report: report, page: page, user:user, pageContext: pageContext, log: log, confirmit: confirmit}
     * @returns {Array} array of objects {Code: pid, Label: pname} for user's pulse surveys
     */
    public function getPulseSurveys(context) : Object[] {

        var report = context.report;
        var log = context.log;
        var rowInfo = report.TableUtils.GetRowHeaderCategoryTitles(_pulseSurveysTablePath);
        var surveyList = [];

        if(_isEmptyOptionNeeded) { // to do: move to system config for consistency?
            var emptyOption = {};
            emptyOption.Label = TextAndParameterUtil.getTextTranslationByKey(context, 'SelectSurveyEmptyOption');
            emptyOption.Code = 'none';
            surveyList[0] = emptyOption;
        }

        var rowInfo2 = report.TableUtils.GetColumnHeaderCategoryIds(_pulseSurveysTablePath);
        log.LogDebug('category titles: '+JSON.stringify(rowInfo));
        log.LogDebug('category titles: '+JSON.stringify(rowInfo2));
        

        surveyList = surveyList.concat(transformTableHeaderTitlesIntoObj(context, rowInfo));

        return surveyList;
    }

    /**
     * help function that transforms string[][] array of row headers into array of standard objects
     * @param {String[][]} string[][] array of row headers
     * @returns {Array} array of objects {Code: pid, Label: pname} for user's pulse surveys
     */
    private function transformTableHeaderTitlesIntoObj(context, HeaderCategoryTitles) {

        var log = context.log;
        var surveyList = [];

        // loop by rows of header groups (many custom tables can be used)
        for(var i=HeaderCategoryTitles.length-1; i>=0; i--) { // reverse order
            var surveyInfo = {};

            var headerRow = HeaderCategoryTitles[i]; // all headers in the row
            var colNum = headerRow.length; // number of columns

            var sureveyId = headerRow[colNum-1];
            var surveyName = headerRow[colNum-2];

            //hardcoded in the table: pid->pname->creator->status
            var addInfo = [];
            /*for(var j=colNum-3; j>=0; j--) {
                var col = headerRow[j];
            }*/
            addInfo = addInfo.join(', ');

            surveyInfo.Label = addInfo.length >0 ? surveyName+' ('+addInfo+')' : surveyName; //label - inner header
            surveyInfo.Code = sureveyId; // pid - outer header
            surveyList.push(surveyInfo);            
        }

        return surveyList;
    }
}
