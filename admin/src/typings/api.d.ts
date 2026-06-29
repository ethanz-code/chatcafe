/**
 * Namespace Api
 *
 * All backend api type
 */
declare namespace Api {
  namespace Core {
    interface Configuration {
      id: number;
      name: string;
      value: string;
      updatedAt: string;
      description: string;
    }

    namespace UserService {
      interface ActivationCode {
        id: number;
        code: string;
        updatedAt: string;
        description: string;
        dialogueCount: number;
        paintingCount: number;
      }

      interface Dialog {
        id: number;
        updatedAt: string;
        title: string;
        uuid: string;
        userId: number;
      }

      interface DialogDetail {
        id: number;
        role: string;
        content: string;
        time: string;
        dialogId: number;
      }

      interface StarDialogDetail {
        id: number;
        dialogUUID: string;
        userId: number;
        userMsg: string;
        assistantMsg: string;
        createdAt: string;
      }

      interface Feedback {
        id: number;
        createdAt: string;
        content: string;
        type: string;
        contact: string;
        userId: number;
      }

      interface Promotion {
        id: number;
        createdAt: string;
        inviteeUserId: number; // 被邀请
        inviteUserId: number; // 邀请人
      }

      interface PunchInDaily {
        id: number;
        createdAt: string;
        rewardDialogue: number;
        userId: number;
      }

      interface TaskReward {
        id: number;
        updatedAt: string;
        condition: string;
        description: string;
        rewardDialogue: number;
        rewardPainting: number;
      }

      interface TaskRewardReceive {
        id: number;
        createdAt: string;
        userId: number;
        taskRewardId: number;
        value: number;
      }

      interface User {
        id: number;
        phoneNumber: string;
        password: string;
        updatedAt: string;
        name: string;
        avatar: string;
        dialogueBalance: number;
        paintingBalance: number;
        inviteCode: string;
      }
    }

    namespace Recharge {
      interface Goods {
        id: number;
        updatedAt: string;
        title: string;
        description: string;
        dialogueCount: number;
        paintingCount: number;
        imgUrl: string;
        price: number;
      }

      interface Order {
        id: number;
        updatedAt: string;
        orderNo: string;
        status: string;
        goodsId: number;
        userId: number;
      }
    }

    namespace Chat {
      namespace Assistant {
        interface Category {
          id: number;
          updatedAt: string;
          name: string;
        }

        interface View {
          id: number;
          updatedAt: string;
          name: string;
          imgUrl: string;
          content_zh_CN: string;
          categoryId: number;
        }
      }

      namespace Language {
        interface Model {
          id: number;
          name: string;
          cost: number;
          model: string;
          apiKey: string;
          baseUrl: string;
          imgUrl: string;
          updatedAt: string;
          relatedUrl: string;
        }

        interface HotIssues {
          id: number;
          description: string;
          updatedAt: string;
        }
      }
    }

  }

  namespace Common {
    /** common params of paginating */
    interface PaginatingCommonParams {
      /** current page number */
      current: number;
      /** page size */
      size: number;
      /** total count */
      total: number;
    }

    /** common params of paginating query list data */
    interface PaginatingQueryRecord<T = any> extends PaginatingCommonParams {
      records: T[];
    }

    /**
     * enable status
     *
     * - "1": enabled
     * - "2": disabled
     */
    type EnableStatus = '1' | '2';

    /** common record */
    type CommonRecord<T = any> = {
      /** record id */
      id: number;
      /** record creator */
      createBy: string;
      /** record create time */
      createTime: string;
      /** record updater */
      updateBy: string;
      /** record update time */
      updateTime: string;
      /** record status */
      status: EnableStatus | null;
    } & T;
  }

  /**
   * namespace Auth
   *
   * backend api module: "auth"
   */
  namespace Auth {
    interface LoginToken {
      tokenAdmin: string;
      refreshToken: string;
    }

    interface UserInfo {
      userId: string;
      userName: string;
      roles: string[];
      buttons: string[];
    }
  }

  /**
   * namespace Route
   *
   * backend api module: "route"
   */
  namespace Route {
    type ElegantConstRoute = import('@elegant-router/types').ElegantConstRoute;

    interface MenuRoute extends ElegantConstRoute {
      id: string;
    }

    interface UserRoute {
      routes: MenuRoute[];
      home: import('@elegant-router/types').LastLevelRouteKey;
    }
  }

  /**
   * namespace SystemManage
   *
   * backend api module: "systemManage"
   */
  namespace SystemManage {
    type CommonSearchParams = Pick<Common.PaginatingCommonParams, 'current' | 'size'>;

    /** role */
    type Role = Common.CommonRecord<{
      /** role name */
      roleName: string;
      /** role code */
      roleCode: string;
      /** role description */
      roleDesc: string;
    }>;

    /** role search params */
    type RoleSearchParams = CommonType.RecordNullable<
      Pick<Api.SystemManage.Role, 'roleName' | 'roleCode' | 'status'> & CommonSearchParams
    >;

    /** role list */
    type RoleList = Common.PaginatingQueryRecord<Role>;

    /** all role */
    type AllRole = Pick<Role, 'id' | 'roleName' | 'roleCode'>;

    /**
     * user gender
     *
     * - "1": "male"
     * - "2": "female"
     */
    type UserGender = '1' | '2';

    /** user */
    type User = Common.CommonRecord<{
      /** user name */
      userName: string;
      /** user gender */
      userGender: UserGender | null;
      /** user nick name */
      nickName: string;
      /** user phone */
      userPhone: string;
      /** user email */
      userEmail: string;
      /** user role code collection */
      userRoles: string[];
    }>;

    /** user search params */
    type UserSearchParams = CommonType.RecordNullable<
      Pick<Api.SystemManage.User, 'userName' | 'userGender' | 'nickName' | 'userPhone' | 'userEmail' | 'status'> &
        CommonSearchParams
    >;

    /** user list */
    type UserList = Common.PaginatingQueryRecord<User>;

    /**
     * menu type
     *
     * - "1": directory
     * - "2": menu
     */
    type MenuType = '1' | '2';

    type MenuButton = {
      /**
       * button code
       *
       * it can be used to control the button permission
       */
      code: string;
      /** button description */
      desc: string;
    };

    /**
     * icon type
     *
     * - "1": iconify icon
     * - "2": local icon
     */
    type IconType = '1' | '2';

    type Menu = Common.CommonRecord<{
      /** parent menu id */
      parentId: number;
      /** menu type */
      menuType: MenuType;
      /** menu name */
      menuName: string;
      /** route name */
      routeName: string;
      /** route path */
      routePath: string;
      /** component */
      component?: string;
      /**
       * i18n key
       *
       * it is for internationalization
       */
      i18nKey?: App.I18n.I18nKey;
      /** iconify icon name or local icon name */
      icon: string;
      /** icon type */
      iconType: IconType;
      /** menu order */
      order: number;
      /** whether to cache the route */
      keepAlive?: boolean;
      /** outer link */
      href?: string;
      /** whether to hide the route in the menu */
      hideInMenu?: boolean;
      /**
       * The menu key will be activated when entering the route
       *
       * The route is not in the menu
       *
       * @example
       *   the route is "user_detail", if it is set to "user_list", the menu "user_list" will be activated
       */
      activeMenu?: import('@elegant-router/types').LastLevelRouteKey;
      /** By default, the same route path will use one tab, if set to true, it will use multiple tabs */
      multiTab?: boolean;
      /** If set, the route will be fixed in tabs, and the value is the order of fixed tabs */
      fixedIndexInTab?: number;
      /** menu buttons */
      buttons?: MenuButton[];
      /** children menu */
      children?: Menu[];
    }>;

    /** menu list */
    type MenuList = Common.PaginatingQueryRecord<Menu>;

    type MenuTree = {
      id: number;
      label: string;
      pId: number;
      children?: MenuTree[];
    };
  }
}
