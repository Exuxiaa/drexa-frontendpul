[33mcommit 42d43e614cbc835ad632d8895280ae88f5d6795a[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mmaster[m[33m)[m
Author: Gimerbone <gimerbone@gmail.com>
Date:   Wed Jun 17 23:03:54 2026 +0700

    Migrate new UI into the codebase

[33mcommit fd815c56a96f7543eac1c78d8ea99c06bfa21a83[m
Merge: 45086ee 13716e1
Author: Gimerbone <gimerbone@gmail.com>
Date:   Wed Jun 17 22:03:52 2026 +0700

    Merge branch 'master' of github.com:Gimerbone/drexa-frontend
    
    # Conflicts:
    #       app/home/page.tsx
    #       app/markets/[sym]/page.tsx
    #       app/markets/page.tsx
    #       app/orders/page.tsx
    #       app/portfolio/page.tsx
    #       app/trade/page.tsx
    #       app/wallet/page.tsx
    #       features/auth/presentation/hooks/useEmailAuth.ts
    #       features/auth/presentation/hooks/useGoogleAuth.ts
    #       features/auth/presentation/hooks/useRegister.ts
    #       features/auth/presentation/pages/email_verification_page.tsx
    #       features/auth/presentation/pages/login_page.tsx
    #       features/auth/presentation/pages/register_page.tsx
    #       features/auth/presentation/pages/registration_details_page.tsx
    #       features/auth/presentation/pages/security_pin_page.tsx
    #       features/core/domain/data/mock_data.ts
    #       features/core/domain/model/coin.ts
    #       features/core/presentation/components/top_nav.tsx
    #       features/home/presentation/pages/home_page.tsx
    #       features/markets/presentation/pages/asset_page.tsx
    #       features/markets/presentation/pages/markets_page.tsx
    #       features/portfolio/presentation/pages/portfolio_page.tsx
    #       features/trade/presentation/pages/trade_page.tsx
    #       features/wallet/presentation/hooks/useDeposit.ts
    #       features/wallet/presentation/pages/wallet_page.tsx
    #       lib/api.ts
    #       package-lock.json

[33mcommit 45086ee229a29839b056300a1d5cfa0d3aff29cc[m
Author: Gimerbone <gimerbone@gmail.com>
Date:   Wed Jun 17 21:53:46 2026 +0700

    Add docs and update to api.ts

[33mcommit 13716e1fef5f1eec24e45e2e24d14e5914c20918[m[33m ([m[1;31morigin/master[m[33m, [m[1;31morigin/HEAD[m[33m)[m
Merge: cb74e2d 41d455c
Author: Muhammad Hafizh <133675330+Gimerbone@users.noreply.github.com>
Date:   Wed Jun 17 21:49:16 2026 +0700

    Merge pull request #7 from Exuxiaa/master
    
    Implement authentication hooks and initial UI for trading portfolio

[33mcommit 41d455c6932b22f8653e24fa44f6ff374cff8ff0[m
Merge: 1c5e51e cb74e2d
Author: Muhammad Hafizh <133675330+Gimerbone@users.noreply.github.com>
Date:   Wed Jun 17 21:44:58 2026 +0700

    Merge branch 'master' into master

[33mcommit cb74e2d96546637fa3917117c30fe5488accd5fa[m
Author: NabilHilmi21 <nabilmhilmi21@gmail.com>
Date:   Thu Jun 11 01:45:28 2026 +0700

    chore: deleted .txt files

[33mcommit aea1b9bde18dfefcd1057fb91311ba4efe9dcdd4[m
Author: NabilHilmi21 <nabilmhilmi21@gmail.com>
Date:   Thu Jun 11 01:42:47 2026 +0700

    Revert "chore: removed Draft API URL file"
    
    This reverts commit ecd4674604054e82bce3c78026bfe2823d88f120.

[33mcommit 5e827b1ca069fdf91b47c5d6b187fb3b9886b63e[m
Author: NabilHilmi21 <nabilmhilmi21@gmail.com>
Date:   Thu Jun 11 01:36:01 2026 +0700

    chore: removed Draft API URL file

[33mcommit 3c1fe56742c5894acc374bdf7045a9471037ff0c[m
Author: NabilHilmi21 <nabilmhilmi21@gmail.com>
Date:   Thu Jun 11 01:32:28 2026 +0700

    refactor(frontend): centralize API calls and split wallet page

[33mcommit 1c5e51efc24eff6b885ddb413f0f602b2ba67212[m
Author: Daffa Ulhaq Purnama Lovind <daffaulhaq05@gmail.com>
Date:   Tue Jun 16 22:08:48 2026 +0700

    implement authentication hooks, market stream data layer, and initial UI pages for portfolio, trading, and asset navigation.

[33mcommit 163b5455261c0f281db6913bc8fe3d27c701a3e1[m
Author: Muhammad Hafizh <133675330+Gimerbone@users.noreply.github.com>
Date:   Wed Jun 10 20:05:25 2026 +0700

    Implementing 3rd party services (#5)
    
    * Implementing Screens
    
    * Integrating 3rd party services

[33mcommit 5c590cdeb67cf87dbb582d5069772fc77c89a4d1[m
Author: Gimerbone <gimerbone@gmail.com>
Date:   Wed Jun 10 19:49:07 2026 +0700

    Integrating 3rd party services

[33mcommit c77c91a52afa2959f9a192dd5e3c31df3c1de219[m
Author: NabilHilmi21 <nabilmhilmi21@gmail.com>
Date:   Sat Jun 6 19:33:30 2026 +0700

    fix: stabilize auth flow and protect dashboard routes

[33mcommit ecfbdc5f9cdcadebdcb574ade738ea862ad30f6a[m
Author: Gimerbone <gimerbone@gmail.com>
Date:   Sat Jun 6 17:29:07 2026 +0700

    Implementing Screens

[33mcommit b2d73eb38e789443c2245f5984f546679d8afcf2[m
Author: Gimerbone <gimerbone@gmail.com>
Date:   Sat Jun 6 17:29:07 2026 +0700

    Implementing Screens

[33mcommit 21f70b0cb5d9aa7bec4f515b1e838af6a2715359[m
Merge: 12b68b4 85f4440
Author: Muhammad Hafizh <133675330+Gimerbone@users.noreply.github.com>
Date:   Sat May 16 19:20:07 2026 +0700

    Merge pull request #2 from Gimerbone/master
    
    restructuring projects into idiomatic format

[33mcommit 85f44408278752417529c5926b67f6da99a993d4[m
Author: Gimerbone <gimerbone@gmail.com>
Date:   Sat May 16 19:02:59 2026 +0700

    extracting domain from the presentation

[33mcommit 033912a0ad23dbe5da673ee5e4e955e0be1321fa[m
Author: Gimerbone <gimerbone@gmail.com>
Date:   Sat May 16 18:33:35 2026 +0700

    Adding Routes to app/

[33mcommit c59965492f1b9cab4d745d9d57b99e44fecaab4a[m
Author: Gimerbone <gimerbone@gmail.com>
Date:   Sat May 16 18:02:20 2026 +0700

    Restructuring project files

[33mcommit 1035fd54e045bfd0de485019f810380a22befd1b[m
Merge: 87d3b1c 12b68b4
Author: Muhammad Hafizh <133675330+Gimerbone@users.noreply.github.com>
Date:   Sat May 16 13:54:18 2026 +0700

    Merge branch 'Hapis-Supremacy:master' into master

[33mcommit 12b68b4855d3587f739e1a1171b5fe465fdf1455[m
Merge: 66701b8 6739db1
Author: Muhammad Hafizh <133675330+Gimerbone@users.noreply.github.com>
Date:   Sat May 16 13:40:52 2026 +0700

    Merge pull request #1 from NabilHilmi21/master
    
    Added dashboard page

[33mcommit 6739db1e77e05f85b76ebeadabb6ec5dce80a3bb[m
Author: NabilHilmi21 <nabilmhilmi21@gmail.com>
Date:   Sat May 16 12:17:32 2026 +0700

    Added dashboard page

[33mcommit 881a624d338b90b2fff4cfbb38603057c1239fa1[m
Author: NabilHilmi21 <nabilmhilmi21@gmail.com>
Date:   Sun May 3 16:29:31 2026 +0700

    Added a security PIN page and some fixes

[33mcommit cca2bc3a064af886a96ea67274827bd358bca24a[m
Author: NabilHilmi21 <nabilmhilmi21@gmail.com>
Date:   Sun May 3 12:17:36 2026 +0700

    Fixed some merges

[33mcommit 87d3b1cdcecc713c3b87491c66557b6727d2714e[m
Author: Gimerbone <gimerbone@gmail.com>
Date:   Sun May 3 12:00:49 2026 +0700

    Setting up firebase

[33mcommit 66701b88293cfc57b14f29cabc29fbd90e1bb977[m
Author: NabilHilmi21 <nabilmhilmi21@gmail.com>
Date:   Fri Apr 17 20:34:10 2026 +0700

    added API calls to some features

[33mcommit 9e2517ed268f67539f40ec16833415b11652a658[m
Author: NabilHilmi21 <nabilmhilmi21@gmail.com>
Date:   Fri Apr 17 18:43:28 2026 +0700

    Finished the Auth's UI
