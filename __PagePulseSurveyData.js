class PagePulseSurveyData {

    /**
     * @param {Object} context
     */
    static public function tablePulseSurveyContentInfo_Render(context) {

        var log = context.log;
        //log.LogDebug('pulse filtering table build start')
        var table = context.table;
        var key = PulseProgramUtil.getKeyForPulseSurveyContentInfo(context);
        var resources = PulseProgramUtil.pulseSurveyContentInfo[key];

        //log.LogDebug('res from table build='+JSON.stringify(resources))

        for (var i = 0; i < resources.length; i++) {

            var resource = resources[i];
            var base: HeaderBase = new HeaderBase();
            var header;

            if (resource.Type === 'Dimension') { //category;            

                header = new HeaderCategorization();
                header.CategorizationId = resource.Code;
                header.DataSourceNodeId = DataSourceUtil.getDsId(context);
                header.Collapsed = true;
                header.Totals = true;
                table.RowHeaders.Add(header); // to avoid case when previous header is added if troubles 

            } else if (resource.Type === 'QuestionId') { // question id

                var questionInfo = QuestionUtil.getQuestionInfo(context, resource.Code);
                var qe: QuestionnaireElement = QuestionUtil.getQuestionnaireElement(context, resource.Code);
                var questionType;

                //define question type to apply correct header properties later
                questionType = (questionInfo.hasOwnProperty('standardType')) ? questionInfo.standardType : questionInfo.type;
                questionType = questionType.toLowerCase();

                if (questionType.indexOf('hierarchy') >= 0) {

                    if (context.user.PersonalizedReportBase) {

                        header = new HeaderSegment();
                        header.DataSourceNodeId = DataSourceUtil.getDsId(context);
                        header.SegmentType = HeaderSegmentType.Expression;
                        header.Expression = HierarchyUtil.getHierarchyFilterExpressionForCurrentRB(context);
                        table.RowHeaders.Add(header);
                    }

                } else if (questionType.indexOf('multi') >= 0) {

                    header = new HeaderQuestion(qe);

                    var mask: MaskFlat = new MaskFlat();
                    mask.IsInclusive = true;
                    header.AnswerMask = mask;
                    header.IsCollapsed = true;
                    header.ShowTotals = true;
                    table.RowHeaders.Add(header);

                } else if (questionType.indexOf('open') >= 0) {

                    header = new HeaderQuestion(qe);
                    header.IsCollapsed = true;
                    table.RowHeaders.Add(header);

                } else if (questionType.indexOf('single') >= 0) { // for singles ...

                    header = new HeaderQuestion(qe);
                    header.IsCollapsed = true;
                    header.ShowTotals = false;
                    table.RowHeaders.Add(header);

                } else {
                    throw new Error('PagePulseSurveyData.tablePulseSurveyContentInfo_Render: question type "' + questionType + '" is not supported');
                }
            }

        }

        table.ColumnHeaders.Add(base);
        table.Caching.Enabled = false;

        //log.LogDebug('pulse filtering table build end')
    }

    /**
     * @param {Object} context
     */
    static public function tableAllSurveys_PidPname_Render(context) {

        var table = context.table;

        var qe_pid: QuestionnaireElement = QuestionUtil.getQuestionnaireElement(context, 'pid');
        var qe_pname: QuestionnaireElement = QuestionUtil.getQuestionnaireElement(context, 'pname');
        var pid: HeaderQuestion = new HeaderQuestion(qe_pid);
        var pname: HeaderQuestion = new HeaderQuestion(qe_pname);

        pid.IsCollapsed = false;
        pid.ShowTotals = false;

        pname.IsCollapsed = false;
        pname.ShowTotals = false;

        pid.SubHeaders.Add(pname);

        table.RowHeaders.Add(pid);
        table.RemoveEmptyHeaders.Rows = true;
        table.Caching.Enabled = false;

    }

    /**
     * @param {Object} context
     */
    static public function tableAllSurveys_PidPname_Hide(context) {
        return DataSourceUtil.isProjectSelectorNotNeeded(context);
    }

    /*
     * Sets up properties of row question headers in table
     *  @param {object} context: {state: state, report: report, log: log, table: table}
     */
    static function setRowHeadersProperties(context) {

        var table = context.table;
        var log = context.log;

        var headers = table.RowHeaders;
        setHeadersProperties(context, headers);
        
    }
  
     /*
     * Sets up properties of specified headers
     *  @param {HeaderCollection} headers
     */
     static function setHeadersProperties(context, headers) {

         var log = context.log;
         var cnt = headers.Count;

         for (var i = 0; i < cnt; i++) {
            var hd: HeaderQuestion = headers[i];
            hd.ShowTotals = false;
            hd.Sorting.Enabled = false;

            var qe : QuestionnaireElement = hd.QuestionnaireElement;

            if(qe.QuestionId == 'CreatedDate') {
                hd.TimeSeries.Time1 = TimeseriesTimeUnitType.Year;
                hd.TimeSeries.Time2 = TimeseriesTimeUnitType.Month;
                hd.TimeSeries.Time3 = TimeseriesTimeUnitType.DayOfMonth;
            }

            setHeadersProperties(context, headers[i].SubHeaders);
        }
     }
}