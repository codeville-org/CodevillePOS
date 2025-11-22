export const TEXTS = {
  language: { en: "English", si: "සිංහල" },
  actions: {
    view: { en: "View", si: "පෙන්වන්න" },
    create: { en: "Create", si: "සාදන්න" },
    edit: { en: "Edit", si: "යාවත්කාලීන කරන්න" },
    delete: { en: "Delete", si: "මකන්න" },
    cancel: { en: "Cancel", si: "අවලංගු කරන්න" }
  },
  categories: {
    title: { en: "Product Categories", si: "භාණ්ඩ වර්ග" },
    subtitle: {
      en: "Manage your product categories",
      si: "ඔබේ භාණ්ඩ වර්ග කළමනාකරණය කරන්න"
    },
    update: {
      title: { en: "Update Category", si: "කාණ්ඩය යාවත්කාලීන කරන්න" },
      description: {
        en: "Make changes to your category here.",
        si: "යාවත්කාලීන කිරීමට අදාල තොරතුරු පහත ෆෝරමයේ ඇතුලත් කරන්න."
      }
    },
    addNew: { en: "Add Category", si: "නව කාණ්ඩය එක් කරන්න" }
  },
  products: {
    title: { en: "Product Inventory", si: "භාණ්ඩ ගබඩාව" },
    subtitle: {
      en: "Manage your store Inventory here",
      si: "ඔබේ භාණ්ඩ ගබඩාව කළමනාකරණය කරන්න"
    },
    update: {
      title: { en: "Update Product", si: "භාණ්ඩය යාවත්කාලීන කරන්න" },
      description: {
        en: "Make changes to your product here.",
        si: "යාවත්කාලීන කිරීමට අදාල තොරතුරු පහත ෆෝරමයේ ඇතුලත් කරන්න."
      }
    },
    addNew: {
      title: { en: "Add Product", si: "නව භාණ්ඩයක් එක් කරන්න" },
      description: {
        en: "Fill below form to create product",
        si: "භාණ්ඩයේ තොරතුරු පහත ෆෝරමයේ ඇතුලත් කරන්න."
      },
      form: {
        name: {
          label: { en: "Product Name", si: "භාණ්ඩයේ නම" },
          placeholder: {
            en: "Elephant House - Strawberry Ice Cream (500ml)",
            si: "එලිෆන්ට් හවුස් - ස්ට්‍රෝබෙරි අයිස් ක්‍රීම් (500ml)"
          }
        },
        category: {
          label: { en: "Product Category", si: "භාණ්ඩ වර්ගය" }
        },
        barcode: {
          label: { en: "Barcode Number", si: "බාර්කෝඩ් අංකය" },
          placeholder: {
            en: "Enter barcode number",
            si: "බාර්කෝඩ් අංකය ඇතුලත් කරන්න."
          }
        },
        description: {
          label: { en: "Product Description", si: "භාණ්ඩ විස්තර" },
          placeholder: {
            en: "Delicious strawberry ice cream",
            si: "භාණ්ඩය පිලිබද සටහන් *(අත්‍යාවශ්‍යය නොවේ)"
          }
        },
        unitPrice: {
          label: { en: "Product Price", si: "භාණ්ඩයේ මිල" },
          placeholder: { en: "120.00", si: "120.00" }
        },
        unitAmount: {
          label: { en: "No. of Units", si: "ඒකක ගණන" },
          placeholder: { en: "100", si: "100" }
        },
        discountedPrice: {
          label: { en: "Discounted Price", si: "අපේ මිල" },
          placeholder: { en: "100.00", si: "100.00" }
        },
        stockQuantity: {
          label: { en: "Stock Quantity", si: "ගබඩා ප්‍රමාණය" },
          placeholder: { en: "100", si: "100" }
        },
        productUnit: {
          label: { en: "Product Unit", si: "භාණ්ඩ ඒකකය" },
          placeholder: { en: "Units", si: "ආකාර" }
        },
        isFeatured: {
          label: { en: "Featured Product", si: "ඉක්මන් අයිතමයක්" },
          placeholder: {
            en: "Mark the product as featured for easy access",
            si: "භාණ්ඩය පහසුවෙන් සොයාගැනීමට උපකාරී වේ"
          }
        },
        productImage: {
          label: { en: "Product Image", si: "භාණ්ඩයේ ඡායාරූපය" },
          placeholder: { en: "Upload image", si: "රූපය උඩුගත කරන්න" }
        },
        reset: { en: "Reset", si: "නැවත සකසන්න" },
        create: { en: "Create Product", si: "භාණ්ඩයක් සාදන්න" },
        edit: { en: "Edit Product", si: "භාණ්ඩයක් යාවත්කාලීන කරන්න" }
      }
    }
  },
  customers: {
    title: { en: "All Customers", si: "ඔබේ පාරිභෝගිකයන්" },
    subtitle: {
      en: "Manage your customers",
      si: "ඔබේ පාරිභෝගිකයන් කළමනාකරණය කරන්න"
    },
    update: {
      title: { en: "Update Customer", si: "පාරිභෝගිකයා යාවත්කාලීන කරන්න" },
      description: {
        en: "Make changes to your customer here.",
        si: "යාවත්කාලීන කිරීමට අදාල තොරතුරු පහත ෆෝරමයේ ඇතුලත් කරන්න."
      }
    },
    addNew: {
      en: "Add Customer",
      si: "නව පාරිභෝගිකයෙක් එක් කරන්න",
      subtitle: {
        en: "Fill customer details in following form",
        si: "පාරිභෝගිකයාගේ විස්තර පහත ෆෝරමයේ ඇතුලත් කරන්න."
      },
      form: {
        name: {
          en: "Name",
          si: "පාරිභෝගිකයාගේ නම",
          placeholder: {
            en: "Enter customer name",
            si: "පාරිභෝගිකයාගේ නම ඇතුලත් කරන්න"
          }
        },
        phone: {
          en: "Phone",
          si: "දුරකථන",
          placeholder: {
            en: "Enter customer phone",
            si: "දුරකථන අංකය ඇතුලත් කරන්න"
          }
        },
        address: {
          en: "Address",
          si: "ලිපිනය",
          placeholder: {
            en: "Enter customer address",
            si: "ලිපිනය ඇතුලත් කරන්න"
          }
        },
        currentBalance: {
          en: "Current Balance",
          si: "වත්මන් ණය ශේෂය",
          placeholder: {
            en: "Enter current balance",
            si: "වත්මන් ණය ශේෂය ඇතුලත් කරන්න"
          }
        },
        totalCreditLimit: {
          en: "Total Credit Limit",
          si: "උපරිම ණය සීමාව",
          placeholder: {
            en: "Enter total credit limit",
            si: "උපරිම ණය සීමාව ඇතුලත් කරන්න"
          }
        },
        notes: {
          en: "Additional Notes",
          si: "අමතර සටහන්",
          placeholder: {
            en: "Enter additional notes",
            si: "අමතර සටහන් ඇතුලත් කරන්න"
          }
        }
      }
    }
  },
  users: {
    title: { en: "User Management", si: "පරිශීලක කළමනාකරණය" },
    subtitle: {
      en: "Manage application users here",
      si: "යෙදුම් පරිශීලකයන් මෙහි කළමනාකරණය කරන්න"
    },
    addNew: {
      button: { en: "Add new User", si: " නව පරිශීලකයෙක් එක් කරන්න" },
      dialog: {
        title: {
          en: "Create new user",
          si: "නව පරිශීලකයෙක් සාදන්න"
        },
        description: {
          en: "Fill below form to create a new user account",
          si: "නව පරිශීලක ගිණුමක් සෑදිම සදහා පහත ෆෝරමය පුරවන්න"
        }
      },
      form: {
        username: {
          label: { en: "Username", si: "පරිශීලක නාමය" },
          placeholder: {
            en: "Enter username",
            si: "පරිශීලක නාමය ඇතුලත් කරන්න"
          },
          description: {
            en: "No spaces, special characters allowed. (e.g., johndoe)",
            si: "හිස්තැන්, විශේෂ අක්ෂර භාවිතා නොකරන්න. (උදා., johndoe)"
          }
        },
        email: {
          label: { en: "Email", si: "ඊමේල් ලිපිනය" },
          placeholder: {
            en: "Enter email address",
            si: "ඊමේල් ලිපිනය ඇතුලත් කරන්න"
          }
        },
        password: {
          label: { en: "Password", si: "මුරපදය" },
          placeholder: {
            en: "Enter password",
            si: "මුරපදය ඇතුලත් කරන්න"
          }
        }
      }
    }
  },
  transactions: {
    title: { en: "All Transactions", si: "සියලුම ගනුදෙනු" },
    subtitle: {
      en: "Manage your store transactions here",
      si: "ඔබේ ගනුදෙනු මෙහි කළමනාකරණය කරන්න"
    }
  },
  reports: {
    title: { en: "Analytics & Reports", si: "විශ්ලේෂණ සහ වාර්තා" },
    subtitle: {
      en: "View comprehensive analytics and insights",
      si: "සවිස්තරාත්මක විශ්ලේෂණ බලන්න"
    },
    filters: {
      today: { en: "Today", si: "අද දින" },
      thisWeek: { en: "This Week", si: "මෙම සතියේ" },
      thisMonth: { en: "This Month", si: "මෙම මාසයේ" },
      thisQuarter: { en: "This Quarter", si: "මෙම කාර්තුවේ" }
    },
    overview: {
      transactions: { en: "Transactions", si: "ගණුදෙනු ගණන" },
      income: { en: "Income", si: "ආදායම" },
      soldItems: { en: "Sold Items", si: "විකිණූ භාණ්ඩ" },
      avgIncome: { en: "Average Income", si: "සාමාන්‍ය ආදායම" }
    },
    sections: {
      salesTrend: { en: "Sales Trend", si: "විකුණුම් ප්‍රවණතාව" },
      topProducts: { en: "Top Products", si: "ඉහළම භාණ්ඩ" },
      topCategories: { en: "Top Categories", si: "ඉහළම කාණ්ඩ" },
      topCustomers: { en: "Top Customers", si: "ඉහළම පාරිභෝගිකයින්" },
      paymentMethods: { en: "Payment Methods", si: "ගෙවීම් ක්‍රම" },
      lowStock: { en: "Low Stock Alert", si: "අඩු තොග අනතුරු ඇඟවීම" }
    }
  },
  lockScreen: {
    username: {
      placeholder: {
        en: "Enter your username here",
        si: "පරිශීලක නම මෙහි ඇතුලත් කරන්න"
      }
    },
    password: {
      placeholder: {
        en: "Enter your password here",
        si: "ඔබේ මුරපදය මෙහි ඇතුලත් කරන්න"
      }
    },
    button: { en: "Login", si: "ඇතුල්වන්න" }
  },
  bill: {
    qty: { en: "Qty.", si: "ප්‍රමාණය" },
    unitPrice: { en: "Unit Price", si: "සදහන් මිල" },
    total: { en: "Total", si: "එකතුව" },
    subtotal: { en: "Sub Total", si: "මුළු මුදල" },
    discount: { en: "Discount", si: "වට්ටම" },
    netTotal: { en: "Net Amount", si: "ගෙවිය යුතු මුදල" },
    cashGiven: { en: "Cash Given", si: "දුන් මුදල" },
    balance: { en: "Change", si: "ඉතිරි මුදල" },
    billNumber: { en: "Bill Number", si: "බිල්පත් අංකය" },
    customer: { en: "Customer", si: "පාරිභෝගික නම" },
    invoiceData: { en: "Invoice Date", si: "නිකුත් කල දිනය" },
    greetings: {
      en: "Thank you...!, Come Again ✨✨",
      si: "ස්තූතියි...! නැවත එන්න ✨✨"
    }
  },
  posSidebar: {
    customer: { en: "Customer", si: "පාරිභෝගිකයා තෝරන්න" },
    inactive: {
      title: {
        en: "No Active Transaction",
        si: "සක්‍රීය ගනුදෙනුවක් නොමැත"
      },
      description: {
        en: "Initialize new Transaction here",
        si: "පහතින් නව ගණුදෙනුවක් ආරම්භ කරන්න"
      }
    },
    cartItems: { en: "Cart Items", si: "ගණුදෙනු භාණ්ඩ " },
    empty: {
      title: { en: "Cart is empty", si: "ගණුදෙනුව දැනට හිස්ව පවතී" },
      subtitle: {
        en: "Add products to start the transaction",
        si: "බාර්කෝඩ් රීඩරය හෝ සෙවුම් තීරුව භාවිතා කර භාණ්ඩ එකතු කරන්න"
      }
    },
    total: { en: "Total", si: "ගෙවිය යුතු මුදල" },
    subtotal: { en: "Subtotal", si: "මුළු මුදල" },
    tax: { en: "Tax", si: "බදු" },
    discount: { en: "Discount", si: "වට්ටම" },
    cashGiven: { en: "Cash Given", si: "දුන් මුදල" },
    balance: { en: "Change", si: "ඉතිරි මුදල" },
    methods: {
      cash: { en: "Cash", si: "මුදල්" },
      card: { en: "Card", si: "කාඩ්පත්" },
      lend: { en: "Lend", si: "ණය" }
    },
    complete: { en: "Complete Purchase", si: "ගණුදෙනුව අවසන් කරන්න" },
    clear: { en: "Clear", si: "හිස් කරන්න" },
    cancel: { en: "Cancel", si: "අවලංගු කරන්න" }
  },
  cashflow: {
    title: {
      en: "Cashflow Management",
      si: "මුදල් ප්‍රවාහ කළමනාකරණය"
    },
    subtitle: {
      en: "Monitor and manage your cashflow here",
      si: "ඔබේ මුදල් ප්‍රවාහය මෙහිදී නිරීක්ෂණය සහ කළමනාකරණය කලහැක"
    }
  }
};
