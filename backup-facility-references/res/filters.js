app.filter('cutstring', function () {
    return function (value, wordwise, max, tail) {
              if (!value) return '';

              max = parseInt(max, 10);
              if (!max) return value;
              if (value.length <= max) return value;

              value = value.substr(0, max);
              if (wordwise) {
                  var lastspace = value.lastIndexOf(' ');
                  if (lastspace != -1) {
                      value = value.substr(0, lastspace);
                  }
              }
              return value + (tail || ' …');
          };
});



app.filter("orderByWithoutDiacritics",["orderByFilter",function(orderByFilter) {
    return function(array, sortPredicate, reverseOrder) {
        if (!Array.isArray(array))
            return array;
        if (!sortPredicate)
            return array;
        var copyOfArray = angular.copy(array);
        for (var i = 0; i < array.length; i++) {
            copyOfArray[i]["original"] = array[i];
            var propertyName = sortPredicate.split(".");
            if (propertyName.length > 1) {
                var object = copyOfArray[i][propertyName[0]];
                if (object == null)
                    continue;
                var objectValue = object[propertyName[1]];
                objectValue = objectValue == null ? ""
                        : objectValue;
                objectValue = objectValue.toString()
                        .toLowerCase();
                copyOfArray[i][propertyName[0]][propertyName[1]] = normalize(objectValue);
                continue;
            }
            var value = copyOfArray[i][sortPredicate];
            value = value == null ? "" : value;
            value = value.toString().toLowerCase();
            copyOfArray[i][sortPredicate] = normalize(value);
        }
        var normalizedSortedArray = orderByFilter(
                copyOfArray, sortPredicate,
                reverseOrder);
        var normalizedSortedOriginalArray = [];
        angular.forEach(normalizedSortedArray,
                function(arrayObject, i) {
                    normalizedSortedOriginalArray
                            .push(arrayObject.original)
                })
        return normalizedSortedOriginalArray;
    }
} ]);