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
        vm.deal(address(3), 100 ether);
    }

    function test_owner_token() public {
        assertEq(pRBProxy.ownerOf(0), address(1));
    }

    function test_mint_pass() public {
        uint256 limit = 100;
        vm.prank(address(1));
        uint256 tokenId = pRBProxy.mintSpendooorPass(address(2), limit);
        assertEq(pRBProxy.limitOf(tokenId), limit);
        assertEq(pRBProxy.balanceOf(address(2)), 1);
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

    function test_only_mint_one_pass() public {
        uint256 limit = 100;
        vm.prank(address(1));
        pRBProxy.mintSpendooorPass(address(2), limit);
        vm.prank(address(1));
        vm.expectRevert();
        pRBProxy.mintSpendooorPass(address(2), limit);
    }

    function test_mint_and_transfer() public {
        uint256 limit = 100;
        vm.prank(address(1));
        uint256 tokenId = pRBProxy.mintSpendooorPass(address(2), limit);
        vm.prank(address(2));
        pRBProxy.safeTransferFrom(address(2), address(3), tokenId);
        assertEq(pRBProxy.balanceOf(address(2)), 0);
        assertEq(pRBProxy.balanceOf(address(3)), 1);
    }

    function test_mint_no_second_transfer() public {
        uint256 limit = 100;
        vm.prank(address(1));
        pRBProxy.mintSpendooorPass(address(2), limit);
        vm.prank(address(1));
        uint256 tokenId = pRBProxy.mintSpendooorPass(address(3), limit);
        vm.prank(address(3));
        vm.expectRevert();
        pRBProxy.safeTransferFrom(address(3), address(2), tokenId);
    }
}