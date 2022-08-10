import { renderHook } from '@vtex/test-tools/react'
import { OrderForm } from 'vtex.order-manager'
import * as productContext from 'vtex.product-context'
import * as reactapollo from 'react-apollo'

import { useSellerLogisticsInfo } from '../../hooks/useSellerLogisticsInfo'
// eslint-disable-next-line jest/no-mocks-import
import { productContextState } from '../../__mocks__/productContext'

describe('useNewProductWithSellers', () => {
  jest
    .spyOn(productContext, 'useProduct')
    .mockImplementation(() => productContextState)

  jest.spyOn(OrderForm, 'useOrderForm').mockImplementation(() => {
    return {
      orderForm: {
        shipping: {
          selectedAddress: {
            postalCode: '',
          },
        },
      },
    }
  })

  it('should return an empty array when logistics info does not exists', async () => {
    // arrange
    jest
      .spyOn(reactapollo, 'useLazyQuery')
      .mockImplementation()
      .mockReturnValue([
        jest.fn(),
        {
          data: { shipping: {} },
          refetch: jest.fn(),
        },
      ] as any)

    // act
    const {
      result: { current: sellersInfoResult },
    } = renderHook(() => useSellerLogisticsInfo())

    // assert
    expect(sellersInfoResult).toStrictEqual([])
  })

  it('should return correctly when logistics info exists', async () => {
    // arrange
    const shippingData = {
      shipping: {
        logisticsInfo: [
          {
            itemIndex: '0',
            slas: [
              {
                id: 'Transportadora1',
                name: 'Transportadora1',
                price: 3520,
              },
              {
                id: 'Transportadora2',
                name: 'Transportadora2',
                price: 3520,
              },
            ],
          },
        ],
      },
    }

    jest
      .spyOn(reactapollo, 'useLazyQuery')
      .mockImplementation()
      .mockReturnValue([
        jest.fn(),
        {
          data: { ...shippingData },
          refetch: jest.fn(),
        },
      ] as any)

    // act
    const {
      result: { current: sellersInfoResult },
    } = renderHook(() => useSellerLogisticsInfo())

    // assert
    expect(sellersInfoResult[0].seller).toStrictEqual(
      productContextState.selectedItem?.sellers[0]
    )
    expect(sellersInfoResult[0].logisticsInfo).toStrictEqual(
      shippingData.shipping.logisticsInfo[0]
    )
    expect(sellersInfoResult[1].seller).toStrictEqual(
      productContextState.selectedItem?.sellers[1]
    )
    expect(sellersInfoResult[1].logisticsInfo).toStrictEqual(
      shippingData.shipping.logisticsInfo[1]
    )
  })

  it('should return correctly when got error to find logistcInfo', async () => {
    // arrange
    jest
      .spyOn(reactapollo, 'useLazyQuery')
      .mockImplementation()
      .mockReturnValue([
        jest.fn(),
        {
          error: new Error(),
          refetch: jest.fn(),
        },
      ] as any)

    // act
    const {
      result: { current: sellersInfoResult },
    } = renderHook(() => useSellerLogisticsInfo())

    // assert
    expect(sellersInfoResult[0].seller).toStrictEqual(
      productContextState.selectedItem?.sellers[0]
    )
    expect(sellersInfoResult[0].logisticsInfo).toBeUndefined()
    expect(sellersInfoResult[1].seller).toStrictEqual(
      productContextState.selectedItem?.sellers[1]
    )
    expect(sellersInfoResult[1].logisticsInfo).toBeUndefined()
  })
})
