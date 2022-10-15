pragma solidity ^0.8.10;

import "forge-std/Test.sol";
import "forge-std/console.sol";

import {PRBProxy} from "../src/PRBProxy.sol";

contract PRBProxyTest is Test {

    PRBProxy pRBProxy;

    function setUp() public {
        vm.prank(address(1));
        pRBProxy = new PRBProxy();

        vm.deal(address(1), 100 ether);
        vm.deal(address(2), 100 ether);
    }

    function test_owner_token() public {
        assertEq(pRBProxy.ownerOf(0), address(1));
    }

    function test_mint_pass() public {
        uint256 limit = 100;
        vm.prank(address(1));
        uint256 tokenId = pRBProxy.mintSpendooorPass(address(2), limit);
        assertEq(pRBProxy.limitOf(tokenId), limit);
    }

    function test_mint_only_owner() public {
        uint256 limit = 100;
        vm.prank(address(2));
        vm.expectRevert();
        pRBProxy.mintSpendooorPass(address(2), limit);
    }

    function test_change_limit() public {
        uint256 limit1 = 100;
        uint256 limit2 = 200;
        vm.prank(address(1));
        uint256 tokenId = pRBProxy.mintSpendooorPass(address(2), limit1);
        vm.prank(address(1));
        pRBProxy.setLimit(tokenId, limit2);
        assertEq(pRBProxy.limitOf(tokenId), limit2);
    }

    function test_change_limit_only_owner() public {
        uint256 limit1 = 100;
        uint256 limit2 = 200;
        vm.prank(address(1));
        uint256 tokenId = pRBProxy.mintSpendooorPass(address(2), limit1);
        vm.prank(address(2));
        vm.expectRevert();
        pRBProxy.setLimit(tokenId, limit2);
    }
}