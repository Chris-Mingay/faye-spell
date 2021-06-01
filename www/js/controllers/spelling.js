spellingAppControllers.controller('SpellingCtrl', function($scope,focus,$http,$ionicSideMenuDelegate) {

  $ionicSideMenuDelegate.canDragContent(false)

  //$scope.wordRate = 1;
  //$scope.sentenceRate = 1.25;


  $scope.records = {
  }

  
  $scope.quizSetupOptions = {
  	quizLength: ["5","10","15","20","25","30","35","40","45","50","All"]
  }

  $scope.speechRate = 1.25;
  if(window.cordova)
      if(window.device.platform == 'iOS')
          if(window.device.version.charAt(0) == '9' || window.device.version.charAt(0) == '1')
              $scope.speechRate = 1.5;


  $scope.data = {
    "record":0,
    "score":null,
    "mode":"title", // title, countdown, quiz, done
    "answer":"",
    "newrecord":false,
    "oldrecord":null,
    "speaking":false,
    "questions":0,
    "answered":0,
    "quizLength":"5"
  };

  $scope.activeQuestion;

  $scope.questions = [];
  $http.get('https://fayespell.ct14hosted.co.uk/quizzes/1.json').success(function(data) {
    $scope.questions = data;
    $scope.data.questions = $scope.questions.length;
  }).error(function(data){
  	console.log(data);
  });

  if(typeof localStorage["records"] !== 'undefined')
  {
  	$scope.records = JSON.parse(localStorage["records"]);
  	console.log("load");
  	console.log($scope.records);
  }
  $scope.$watch('records',function(newVal)
  {
  	localStorage['records'] = JSON.stringify(newVal);
  	console.log("save records");
  	console.log(newVal);
  },true);

  if(typeof localStorage["record"] !== 'undefined')
  {

    $scope.data.record = localStorage["record"];
    if($scope.data.record == 'undefined')
    {
    	$scope.data.record = 0;
    	localStorage["record"] = $scope.data.record;
    }
  }

  $scope.pendingQuestions;
  $scope.answeredQuestions;

  $scope.goHome = function()
  {
  	$scope.data.mode = "title";
  }

  
  $scope.startQuiz = function()
  {
	if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
    }

    console.log("Start quiz");

    $scope.pendingQuestions = JSON.parse(JSON.stringify($scope.questions));
    $scope.answeredQuestions = [];  
    $scope.data.mode = "quiz";
    $scope.data.answered = 0;
    $scope.data.questions = ($scope.data.quizLength == "All" ? $scope.pendingQuestions.length : $scope.data.quizLength);
    $scope.pickQuestion();
    
  }

  $scope.pickQuestion = function()
  {

    $scope.data.answer = "";

    var count = $scope.pendingQuestions.length;

    if(count==0 || $scope.data.answered == $scope.data.quizLength)
    {
      $scope.finishQuiz();
      return;
    }

    var i = randomIntFromInterval(0,count);
    $scope.activeQuestion = $scope.pendingQuestions[i];
    $scope.pendingQuestions.splice(i,1);

    $scope.sayWord();

  }

  $scope.answerQuestion = function()
  {
    if($scope.data.answer==''){ return; }

    $scope.activeQuestion.correct = $scope.activeQuestion.word.toLowerCase()==$scope.data.answer.toLowerCase();
    $scope.activeQuestion.answer = $scope.data.answer.toLowerCase();
    $scope.answeredQuestions.push($scope.activeQuestion);
    $scope.data.answered++;
    $scope.pickQuestion();
  }

  $scope.finishQuiz = function()
  {
    $scope.data.score = 0;
    for(var i = 0; i < $scope.answeredQuestions.length;i++)
    {
      if($scope.answeredQuestions[i].correct == true)
      {
        $scope.data.score++;
      }
    }

    if(!$scope.records.hasOwnProperty($scope.data.quizLength))
    {
    	$scope.records[$scope.data.quizLength] = {
    		trophy: false,
    		bestScore: 0,
    		when: new Date(),
    		scores: [
    		]
    	}
    }

    var thisRecord = $scope.records[$scope.data.quizLength];

    if($scope.data.score > thisRecord.bestScore)
    {
    	thisRecord.bestScore = $scope.data.score;
    	thisRecord.when = new Date();
    	$scope.data.newrecord = true;
    }

    if($scope.data.score == $scope.data.questions)
    {
    	thisRecord.trophy = true;
    }

    thisRecord.scores.push({
    	score: $scope.data.score,
    	when: new Date()
    });


    //$scope.data.newrecord = ($scope.data.score > $scope.data.record);
    if($scope.data.newrecord)
    {
      $scope.data.record = $scope.data.score;
    }

    $scope.data.mode = "done";
    
  }

  $scope.sayWord = function()
  {

    
  	if(!window.device){
  		console.log($scope.activeQuestion.word);
  		return;
  	}

    $scope.data.speaking = true;
    focus('answerInput');

    TTS.speak({
           text: $scope.activeQuestion.word,
           locale: 'en-GB',
           rate: $scope.speechRate
       }, function () {
            // Do Something after success
            $scope.$apply(function(){
              $scope.data.speaking = false;
            });
       }, function (reason) {
           // Handle the error case
           $scope.$apply(function(){
              $scope.data.speaking = false;
            });
       });
  }

  $scope.saySentence = function()
  {

    if(!window.device){
  		console.log($scope.activeQuestion.sentence);
  		return;
  	}

    $scope.data.speaking = true;
    focus('answerInput');

    TTS.speak({
           text: $scope.activeQuestion.sentence,
           locale: 'en-GB',
           rate: $scope.speechRate
       }, function () {
           // Do Something after success
           $scope.$apply(function(){
              $scope.data.speaking = false;
            });
       }, function (reason) {
           // Handle the error case
           $scope.$apply(function(){
              $scope.data.speaking = false;
            });
       });
  }

});