#
#  JavaScript Restrictor is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
# SPDX-FileCopyrightText: 2020  Martin Bednar
# SPDX-License-Identifier: GPL-3.0-or-later
#

import pytest

from values_getters import get_referrer


## Setup method - it is run before referrer test execution starts.
#
#  This setup method initialize variable referrer that contains current data about referrer and
#  this variable is provided to referrer test and value in referrer variable is compared with expected values.
@pytest.fixture(scope='module', autouse=True)
def referrer(browser):
    return get_referrer(browser.driver)


## Test referrer - where the page was navigated from.
def test_referrer(browser, referrer, expected):
    if expected.referrer == 'REAL VALUE':
        assert referrer == browser.real.referrer
    else:
        assert referrer == expected.referrer
