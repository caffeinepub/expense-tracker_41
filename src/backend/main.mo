import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Authorization state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  public type Transaction = {
    id : Nat;
    txType : Text;
    amount : Float;
    category : Text;
    description : Text;
    date : Text;
    createdAt : Int;
  };

  public type CategoryStat = {
    category : Text;
    total : Float;
  };

  public type UserProfile = {
    name : Text;
  };

  // State
  let monthlyBudgets = Map.empty<Principal, Float>();
  let userTransactions = Map.empty<Principal, List.List<Transaction>>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextTxId = 0;

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Transaction CRUD
  public shared ({ caller }) func addTransaction(txType : Text, amount : Float, category : Text, description : Text, date : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add transactions");
    };

    let id = nextTxId;
    nextTxId += 1;

    let transaction : Transaction = {
      id;
      txType;
      amount;
      category;
      description;
      date;
      createdAt = Time.now();
    };

    let existing = switch (userTransactions.get(caller)) {
      case (null) { List.empty<Transaction>() };
      case (?txs) { txs };
    };

    existing.add(transaction);
    userTransactions.add(caller, existing);
    id;
  };

  public query ({ caller }) func getAllTransactions() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get transactions");
    };

    switch (userTransactions.get(caller)) {
      case (null) { [] };
      case (?txs) { txs.toArray() };
    };
  };

  public shared ({ caller }) func updateTransaction(id : Nat, txType : Text, amount : Float, category : Text, description : Text, date : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update transactions");
    };

    switch (userTransactions.get(caller)) {
      case (null) { Runtime.trap("Transaction not found") };
      case (?txs) {
        let updated = txs.map<Transaction, Transaction>(
          func(tx) {
            if (tx.id == id) {
              {
                id;
                txType;
                amount;
                category;
                description;
                date;
                createdAt = tx.createdAt;
              };
            } else {
              tx;
            };
          }
        );
        userTransactions.add(caller, updated);
      };
    };
  };

  public shared ({ caller }) func deleteTransaction(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete transactions");
    };

    switch (userTransactions.get(caller)) {
      case (null) { Runtime.trap("Transaction not found") };
      case (?txs) {
        let filtered = txs.filter(func(tx) { tx.id != id });
        userTransactions.add(caller, filtered);
      };
    };
  };

  // Budget Management
  public shared ({ caller }) func setMonthlyBudget(budget : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set budget");
    };
    monthlyBudgets.add(caller, budget);
  };

  public query ({ caller }) func getMonthlyBudget() : async ?Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get budget");
    };
    monthlyBudgets.get(caller);
  };

  // Statistics
  public query ({ caller }) func getMonthlyStats() : async {
    totalIncome : Float;
    totalExpenses : Float;
    balance : Float;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get stats");
    };

    var totalIncome = 0.0;
    var totalExpenses = 0.0;

    switch (userTransactions.get(caller)) {
      case (null) {};
      case (?txs) {
        txs.forEach(func(tx) {
          if (tx.txType == "income") {
            totalIncome += tx.amount;
          } else if (tx.txType == "expense") {
            totalExpenses += tx.amount;
          };
        });
      };
    };

    {
      totalIncome;
      totalExpenses;
      balance = totalIncome - totalExpenses;
    };
  };

  public query ({ caller }) func getCategoryStats() : async [CategoryStat] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get category stats");
    };

    let categoryMap = Map.empty<Text, Float>();

    switch (userTransactions.get(caller)) {
      case (null) {};
      case (?txs) {
        txs.forEach(func(tx) {
          let currentTotal = switch (categoryMap.get(tx.category)) {
            case (null) { 0.0 };
            case (?total) { total };
          };
          categoryMap.add(tx.category, currentTotal + tx.amount);
        });
      };
    };

    let result = List.empty<CategoryStat>();
    categoryMap.forEach(func(category, total) {
      result.add({ category; total });
    });

    result.toArray();
  };
};
