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

        if(storageInfo.hasOwnProperty('additionalInfo')) {
            _additionalInfo = storageInfo.additionalInfo;
        } else {
            throw new Error ('PulseSurveys_ReportalTable: additional info is not provided for pulse program surveys table');
        }
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
        var report = context.report;
        var surveyList = [];

        var rowInfoWithDates = report.TableUtils.GetRowHeaderCategoryTitles(_pulseSurveysTablePath + '_Date');

        // loop by rows of header groups (many custom tables can be used)
        for(var i=HeaderCategoryTitles.length-1; i>=0; i--) { // reverse order
            var surveyInfo = {};

            var headerRow = HeaderCategoryTitles[i]; // all headers in the row
            var colNum = headerRow.length; // number of columns

            var sureveyId = headerRow[colNum-1]; //always last
            var surveyName = headerRow[colNum-2]; // always one before last

            //hardcoded in the table: pid->pname->creator->status
            var addInfo = [];

            if(_additionalInfo['CreatedByEndUserName']) {
                var author = headerRow[colNum-3];
                author.length>0 ? addInfo.push(author) : addInfo.push('undefined user'); //better ideas welcome
            }

            if(_additionalInfo['Status']) {
                addInfo.push(headerRow[colNum-4]);
            }

            var createdDate_Year = parseInt(rowInfoWithDates[i][rowInfoWithDates[i].length - 2]);
            var createdDate_Month = DateUtil.GetMonthCodeByName(rowInfoWithDates[i][rowInfoWithDates[i].length - 3]);
            var createdDate_Day = parseInt(rowInfoWithDates[i][rowInfoWithDates[i].length - 4]);

            var createdDate : DateTime = new DateTime(createdDate_Year, createdDate_Month, createdDate_Day);

            if(_additionalInfo['CreatedDate']) {
                addInfo.push(DateUtil.formatDateTimeToString(createdDate));
            }

            addInfo = addInfo.join(', ');

            surveyInfo.Label = addInfo.length >0 ? surveyName+' ('+addInfo+')' : surveyName; //label - inner header
            surveyInfo.Label = surveyInfo.Label.toUpperCase();
            surveyInfo.Code = sureveyId; // pid - outer header
            surveyInfo.CreatedDate = createdDate;

            surveyList.push(surveyInfo);
        }

        return surveyList.sort(sortSurveyListByCreatedDateDescending);
    }

    /**
     * help function that sorts pulse surveys descending using their Created Date
     */
    static function sortSurveyListByCreatedDateDescending(a, b) {
        if(DateTime.Compare(a.CreatedDate, b.CreatedDate) < 0) return 1;
        if(DateTime.Compare(a.CreatedDate, b.CreatedDate) == 0) return 0;
        if(DateTime.Compare(a.CreatedDate, b.CreatedDate) > 0) return -1;
    }
}
